"use client";

import { useState } from "react";
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
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { CreateListingModal } from "@/components/create-listing-modal";
import { EditListingModal } from "@/components/edit-listing-modal";
import { DeleteListingModal } from "@/components/delete-listing-modal";
import { ViewListingModal } from "@/components/view-listing-modal";
import { supabase } from "@/hooks/supabase";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function ManageListingsClient({
  initialListings,
  userId,
}: {
  initialListings: any[];
  userId: string | null;
}) {
  const [data, setData] = useState(initialListings);
  const [editListing, setEditListing] = useState<any>(null);
  const [listingToDelete, setListingToDelete] = useState<any>(null);
  const [listingToView, setListingToView] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const { account } = useWallet();
  const { toast } = useToast();
  const router = useRouter();
  const dateNow = Date();

  const refresh = () => router.refresh();

  const handleConfirmDelete = async () => {
    try {
      const parts = listingToDelete.image_url.split("/");
      const userId = parts[parts.length - 4];
      const imageId = parts[parts.length - 1];

      await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!)
        .remove([`${userId}/listings/images/${imageId}`]);

      await supabase
        .from("listings")
        .delete()
        .match({ id: listingToDelete.id, status: "available" });

      toast({
        title: "Listing deleted",
        description: `"${listingToDelete.title}" has been removed.`,
      });

      refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    } finally {
      setDeleteModalOpen(false);
      setListingToDelete(null);
    }
  };

  if (!account) {
    return (
      <main className="pt-24 pb-20 px-4 text-center">
        <p className="text-muted-foreground">
          Connect your wallet to manage your listings.
        </p>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Listings</h1>
            <p className="text-muted-foreground">
              Create and manage your properties.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Listing
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Stat title="Total" value={data.length} icon={Home} />
          <Stat
            title="Available"
            value={data.filter((l) => l.status === "available").length}
            icon={Activity}
          />
          <Stat
            title="Rented"
            value={data.filter((l) => l.status === "rented").length}
            icon={Users}
          />
          <Stat
            title="Escrowed"
            value={
              data.filter(
                (l) => !["available", "rented"].includes(l.status),
              ).length
            }
            icon={Users}
          />
        </div>

        {/* Table omitted for brevity — unchanged logic */}

        <CreateListingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={refresh}
        />
        <EditListingModal
          listin={editListing}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEdit={refresh}
        />
        <DeleteListingModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          listingTitle={listingToDelete?.title ?? ""}
        />
        <ViewListingModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          listing={listingToView}
          isOwner={listingToView?.profiles?.address === account}
          dateNow={dateNow}
          onClickEdit={() => {
          localStorage.setItem("listingToEdit", JSON.stringify(listingToView));
          setEditListing(listingToView);
          setIsEditModalOpen(true);
        }}
        />
      </div>
    </main>
  );
}

function Stat({ title, value, icon: Icon }: any) {
  return (
    <Card>
      <CardContent className="pt-3 flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
