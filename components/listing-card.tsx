"use client";

import Image from "next/image";
import {
  MapPin,
  Bed,
  Bath,
  ExternalLink,
  Settings,
  Eye,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CreateEscrowModal } from "@/components/create-escrow-modal";
import { useWallet } from "@/hooks/use-wallet";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { ViewListingModal } from "./view-listing-modal";
import { EditListingModal } from "./edit-listing-modal";

interface Listing {
  id: string;
  title: string;
  location: string;
  price: string;
  image_url: string;
  profiles: { address: string };
  description: string;
  bedrooms: number;
  bathrooms: number;
  contact: string;
}

interface ListingCardProps {
  listing: Listing;
  dateNow: string;
}

export function ListingCard({ listing, dateNow }: ListingCardProps) {
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const { account } = useWallet();
  const router = useRouter();
  const [editListing, setEditListing] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isTestnet = process.env.NEXT_PUBLIC_NETWORK === "sepolia";

  const truncateSeller = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Card className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 relative">
        {listing.profiles.address == account && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-primary text-primary-foreground border-none font-semibold">
              Owner
            </Badge>
          </div>
        )}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={`${listing.image_url}` || "/placeholder.svg"}
            alt={listing.title}
            fill
            className="object-cover"
            loading="eager"
          />
        </div>

        <CardContent className="pt-4 pb-3">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                {listing.title}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="line-clamp-1">{listing.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{listing.bedrooms} bed</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{listing.bathrooms} bath</span>
              </div>
            </div>

            {/* <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {listing.description}
            </p> */}

            <div className="flex justify-between pt-2">
              <div>
                <div className="text-2xl font-bold text-primary">
                  ${listing.price} <span className="text-xs">in MNEE</span>
                </div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
              <div className="pt-2">
                {/* <div className="text-xs text-muted-foreground mb-1">Contact</div> */}
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">{listing.contact}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1">Landlord</div>
              <div className="flex items-center justify-between">
                <code className="text-xs bg-secondary px-2 py-1 rounded">
                  {truncateSeller(listing.profiles.address)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 w-7 p-0"
                  title="View on block explorer"
                >
                  <a
                    href={`https://${isTestnet ? "sepolia." : ""}etherscan.io/address/${listing.profiles.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4">
          <div className="flex gap-1 w-full">
            <Button
              className="w-1/2 bg-transparent flex items-center justify-center text-primary"
              variant="outline"
              onClick={() => setShowViewModal(true)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {listing.profiles.address == account?"View/Edit":"Details"}
            </Button>

            {listing.profiles.address == account ? (
              <Button
                variant="outline"
                className="w-1/2 bg-transparent"
                asChild
              >
                <Link
                  href="/manage-listings"
                  className="flex items-center justify-center text-primary"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Your Listings
                </Link>
              </Button>
            ) : (
              <Button
                className="w-1/2 flex items-center justify-center border-none"
                onClick={() => setShowEscrowModal(true)}
              >
                Rent with Escrow
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <CreateEscrowModal
        listing={listing}
        isOpen={showEscrowModal}
        onClose={() => setShowEscrowModal(false)}
        onCreate={() => {
          router.push("/dashboard");
        }}
      />
      <ViewListingModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        listing={listing}
        onClickEdit={() => {
          localStorage.setItem("listingToEdit", JSON.stringify(listing));
          setEditListing(listing);
          setIsEditModalOpen(true);
        }}
        isOwner={listing.profiles.address == account}
        dateNow={dateNow}
      />

      <EditListingModal
        listin={editListing}
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditListing({});
          setIsEditModalOpen(false);
        }}
        onEdit={() => router.push("/listings")}
      />
    </>
  );
}
