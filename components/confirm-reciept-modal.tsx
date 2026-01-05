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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

interface ConfirmReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listingTitle: string;
  isLoading?: boolean;
}

export function ConfirmReceiptModal({
  isOpen,
  onClose,
  onConfirm,
  listingTitle,
  isLoading,
}: ConfirmReceiptModalProps) {
  const [keysReceived, setKeysReceived] = useState(false);
  const [movedIn, setMovedIn] = useState(false);

  const isComplete = keysReceived && movedIn;

  const handleConfirm = () => {
    if (isComplete) {
      onConfirm();
      setKeysReceived(false);
      setMovedIn(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Confirm Receipt</DialogTitle>
          <DialogDescription className="text-center">
            Before the funds are released to the landlord, please confirm that
            you have received the keys and moved into{" "}
            <span className="font-semibold text-foreground">
              "{listingTitle}"
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keys-received"
              checked={keysReceived}
              onCheckedChange={(checked) => setKeysReceived(checked as boolean)}
              disabled={isLoading}
            />
            <Label
              htmlFor="keys-received"
              className="cursor-pointer font-medium"
            >
              I have received the apartment keys
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="moved-in"
              checked={movedIn}
              onCheckedChange={(checked) => setMovedIn(checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="moved-in" className="cursor-pointer font-medium">
              I have moved in and everything is as described
            </Label>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isComplete || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="text-primary-foreground" />
                Processing...
              </>
            ) : (
              "Confirm Receipt"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
