"use client";
import { X, MapPin, DollarSign, Bed, Bath, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ViewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
}

export function ViewListingModal({
  isOpen,
  onClose,
  listing,
}: ViewListingModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rented":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "escrowed":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const isEditDisabled =
    listing.status === "rented" || listing.status === "escrowed";
  const status =
    listing.status === "available" || listing.status === "rented"
      ? listing.status
      : "escrowed";

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-2xl font-bold">View Listing</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Property details
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Property Image */}
          {listing.image_url && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={listing.image_url || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-80 object-cover"
              />
            </div>
          )}

          {/* Title and Status */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-2xl font-bold">{listing.title}</h3>
              <Badge className={`${getStatusColor(listing.status)}`}>
                {listing.status.charAt(0).toUpperCase() +
                  listing.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <div className="bg-card border border-border/50 rounded-lg p-5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-md font-semibold text-foreground mt-1">
                    {listing.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-lg p-5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Monthly Rent
                  </p>
                  <p className="text-md font-semibold text-foreground mt-1">
                    ${listing.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-lg p-5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <Bed className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Bedrooms
                  </p>
                  <p className="text-md font-semibold text-foreground mt-1">
                    {listing.bedrooms}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-lg p-5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <Bath className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Bathrooms
                  </p>
                  <p className="text-md font-semibold text-foreground mt-1">
                    {listing.bathrooms}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
              Description
            </h4>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {isEditDisabled && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
              <Lock className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-400">
                  This listing cannot be edited
                </p>
                <p className="text-xs text-amber-400/70">
                  Escrowed or rented listings are locked for security
                </p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-primary bg-transparent"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
