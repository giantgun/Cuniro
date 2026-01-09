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
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

interface AgreeTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => Promise<void>;
  terms: string;
  listingTitle: string;
  isLoading?: boolean;
}

export function AgreeTermsModal({
  isOpen,
  onClose,
  onAgree,
  terms,
  listingTitle,
  isLoading,
}: AgreeTermsModalProps) {
  const [termsAgreed, setTermsAgreed] = useState(false);

  const isComplete = termsAgreed;

  const handleAgree = async () => {
    if (isComplete) {
      await onAgree();
      setTermsAgreed(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Agree to Terms</DialogTitle>
          <DialogDescription className="text-center">
            Review and agree to the rental terms for{" "}
            <span className="font-semibold text-foreground">
              "{listingTitle}"
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Terms Display */}
          <div className="bg-secondary/30 border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">
              Rental Terms & Conditions
            </h3>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
              {terms}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="keys-received"
              checked={termsAgreed}
              onCheckedChange={(checked) => setTermsAgreed(checked as boolean)}
              disabled={isLoading}
              className="border-2 border-primary/70"
            />
            <Label
              htmlFor="keys-received"
              className="cursor-pointer font-medium"
            >
              I agree to these terms and conditions
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
            onClick={handleAgree}
            disabled={!isComplete || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="text-primary-foreground" />
                Processing
              </>
            ) : (
              "I Agree & Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
