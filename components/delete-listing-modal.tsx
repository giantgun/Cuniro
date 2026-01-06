"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { useState } from "react";

interface DeleteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listingTitle: string;
}

export function DeleteListingModal({
  isOpen,
  onClose,
  onConfirm,
  listingTitle,
}: DeleteListingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirm = async () => {
    setIsLoading(true);
    //await new Promise((resolve) => setTimeout(resolve, 1500));
    await onConfirm();
    setIsLoading(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Delete Listing?</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{listingTitle}"
            </span>
            ? This action cannot be undone and will remove the property from the
            public listings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="bg-transparent">
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleConfirm}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="text-secondary-foreground" />
                Deleting...
              </>
            ) : (
              "Delete Listing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
