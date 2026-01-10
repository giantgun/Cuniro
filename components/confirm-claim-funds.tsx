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

interface ConfirmClaimFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  listingTitle: string;
  amount: string;
  isLoading?: boolean;
}

export function ConfirmClaimFundsModal({
  isOpen,
  onClose,
  onConfirm,
  listingTitle,
  amount,
  isLoading,
}: ConfirmClaimFundsModalProps) {
  const [keysGiven, setKeysGiven] = useState(false);
  const [buyerMovedIn, setBuyerMovedIn] = useState(false);

  const isComplete = keysGiven && buyerMovedIn;

  const handleConfirm = async () => {
    if (isComplete) {
      await onConfirm();
      setKeysGiven(false);
      setBuyerMovedIn(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Claim Funds</DialogTitle>
          <DialogDescription className="text-center">
            Before claiming{" "}
            <span className="font-semibold text-foreground">{amount} MNEE</span>{" "}
            for{" "}
            <span className="font-semibold text-foreground">
              "{listingTitle}"
            </span>
            , please confirm the key details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keys-given"
              checked={keysGiven}
              onCheckedChange={(checked) => setKeysGiven(checked as boolean)}
              disabled={isLoading}
              className="border-2 border-primary/70"
            />
            <Label htmlFor="keys-given" className="cursor-pointer font-medium">
              I have given the apartment keys to the buyer
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="buyer-moved-in"
              checked={buyerMovedIn}
              onCheckedChange={(checked) => setBuyerMovedIn(checked as boolean)}
              disabled={isLoading}
              className="border-2 border-primary/70"
            />
            <Label
              htmlFor="buyer-moved-in"
              className="cursor-pointer font-medium"
            >
              The buyer has moved in
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
                Processing
              </>
            ) : (
              "Claim Funds"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
