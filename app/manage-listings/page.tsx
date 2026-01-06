"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Plus,
  Edit2,
  Trash2,
  Home,
  MapPin,
  Users,
  Activity,
} from "lucide-react";
import { CreateListingModal } from "@/components/create-listing-modal";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/hooks/supabase";
import { useWallet } from "@/hooks/use-wallet";
import { Spinner } from "@/components/ui/spinner";
import { EditListingModal } from "@/components/edit-listing-modal";
import { useToast } from "@/hooks/use-toast";
import { DeleteListingModal } from "@/components/delete-listing-modal";

// Mock landlord listings
const initialListings = [
  {
    id: "1",
    title: "Modern Studio Near Campus",
    location: "Downtown University District",
    price: "850",
    status: "active",
    views: 124,
    rented: 0,
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: "4",
    title: "Luxury 1BR with Balcony",
    location: "City Center Premium",
    price: "1200",
    status: "rented",
    views: 342,
    rented: 1,
    bedrooms: 1,
    bathrooms: 1,
  },
];

export default function ManageListingsPage() {
  const [editListing, setEditListing] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(false);
  const { account, autoDisconnect } = useWallet();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<any | null>(null);
  const { toast } = useToast();

  const handleDeleteClick = (listing: any) => {
    setListingToDelete(listing);
    console.log("lis ", listing);
    if (!(listing.status == "available")) {
      toast({
        title: "Delete not allowed",
        description: `"${listing.title}" delete not allowed, because it's associated with an active escrow or it's rented.`,
        variant: "destructive",
      });
      return;
    }

    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (listingToDelete) {
      try {
        const parts = listingToDelete.image_url?.split("/");
        console.log(parts[parts.length - 1], " | ", parts[parts.length - 4]);
        const userId = parts[parts.length - 4];
        const imageId = parts[parts.length - 1];

        const { data, error: imageDeleteError } = await supabase.storage
          .from("unicrow")
          .remove([`${userId}/listings/images/${imageId}`]);

        if (imageDeleteError) {
          throw imageDeleteError;
        }

        const { error } = await supabase
          .from("listings")
          .delete()
          .match({ id: listingToDelete.id, status: "available" });

        if (error) {
          throw error;
        }

        setReloadFlag(!reloadFlag);
        toast({
          title: "Listing deleted",
          description: `"${listingToDelete.title}" has been removed.`,
          variant: "success",
        });
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Delete failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setDeleteModalOpen(false);
        setListingToDelete(null);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          autoDisconnect();
          throw userError;
        }

        const { data, error } = await supabase
          .from("listings")
          .select(`* `)
          .eq("owner_id", user!.id);
        if (error) {
          throw error;
        }
        setData(data);
      } catch (error: any) {
        console.error("Error", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (account) {
      fetchData();
    }
  }, [account, reloadFlag]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Manage Listings
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage your property listings for students.
              </p>
            </div>
            {account && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Listing
              </Button>
            )}
          </div>

          {isLoading ? (
            <Spinner size="lg" className="mx-auto my-4" />
          ) : (
            <>
              {account && (
                <>
                  {/* Stats Section - Bento Grid style inspired by image */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-card border-border">
                      <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Home className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Listings
                            </p>
                            <p className="text-2xl font-bold">{data.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Available Listings
                            </p>
                            <p className="text-2xl font-bold">
                              {
                                data.filter((l) => l.status === "available")
                                  .length
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Rented Listings
                            </p>
                            <p className="text-2xl font-bold">
                              {data.filter((l) => l.status === "rented").length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Escrowed Listings
                            </p>
                            <p className="text-2xl font-bold">
                              {
                                data.filter((l) => !(l.status === "available"))
                                  .length
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Listings Table/List */}
                  <Card className="bg-card border-border overflow-hidden">
                    <CardHeader className="border-b border-border bg-muted/30">
                      <CardTitle>Your Properties</CardTitle>
                      <CardDescription>
                        A list of all your posted properties
                      </CardDescription>
                    </CardHeader>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left m-auto">
                        <thead>
                          <tr className="border-b border-border bg-muted/10">
                            <th className="p-4 font-medium text-sm">
                              Property
                            </th>
                            <th className="p-4 font-medium text-sm">Status</th>
                            <th className="p-4 font-medium text-sm">Price</th>
                            {/* <th className="p-4 font-medium text-sm">Views</th> */}
                            <th className="p-4 font-medium text-sm text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                          {data &&
                            data.map((listing) => (
                              <tr
                                key={listing.id}
                                className="hover:bg-muted/5 transition-colors"
                              >
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-semibold">
                                      {listing.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center mt-1">
                                      <MapPin className="h-3 w-3 mr-1" />{" "}
                                      {listing.location}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge
                                    variant={
                                      listing.status === "available"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {listing.status == "available" ||
                                    listing.status == "rented"
                                      ? `${listing.status.toUpperCase()}`
                                      : "ESCROWED"}
                                  </Badge>
                                </td>
                                <td className="p-4 font-mono text-sm">
                                  ${listing.price}
                                </td>
                                {/* <td className="p-4 text-sm text-muted-foreground">{listing.views}</td> */}
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        if (!(listing.status == "available")) {
                                          toast({
                                            title: "Editing not allowed",
                                            description: `"${listing.title}" Edit not allowed because, it is associated with an active escrow or it's rented.`,
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        localStorage.setItem(
                                          "listingToEdit",
                                          JSON.stringify(listing),
                                        );
                                        setEditListing(listing);
                                        setIsEditModalOpen(true);
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteClick(listing)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {data!.length === 0 && !isLoading && (
                        <div className="p-12 text-center">
                          <p className="text-muted-foreground">
                            You haven't added any listings yet.
                          </p>
                        </div>
                      )}
                      {isLoading && (
                        <Spinner size="lg" className="mx-auto my-4" />
                      )}
                    </div>
                  </Card>
                </>
              )}
            </>
          )}

          {!account && !isLoading && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">
                Connect your wallet to manage your listings.
              </p>
            </div>
          )}
        </div>
      </main>

      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={() => setReloadFlag(!reloadFlag)}
      />
      <EditListingModal
        listin={editListing}
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditListing({});
          setIsEditModalOpen(false);
        }}
        onEdit={() => setReloadFlag(!reloadFlag)}
      />
      <DeleteListingModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        listingTitle={listingToDelete?.title || ""}
      />
    </div>
  );
}
