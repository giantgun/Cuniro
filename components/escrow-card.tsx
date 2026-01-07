"use client";

import { useState } from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Scale,
  ExternalLink,
  Phone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useContract } from "@/hooks/use-contract";
import { Spinner } from "./ui/spinner";
import { ConfirmReceiptModal } from "./confirm-reciept-modal";
import { ConfirmClaimFundsModal } from "./confirm-claim-funds";

export interface Escrow {
  id: string;
  listing_title: string;
  amount: string;
  status: "active" | "pending" | "completed" | "disputed" | "refunded";
  role: "buyer" | "seller" | "arbiter";
  seller_address: string;
  buyer_address: string;
  arbiter_address: string;
  arbiter_name: string;
  created_at: string;
  timeout: number;
  daysLeft: number;
  terms: string;
  dispute_reason?: string;
  listing_id: number;
  listings: any;
}

interface EscrowCardProps {
  escrow: Escrow;
  onStateChange: () => void;
}

export function EscrowCard({ escrow, onStateChange }: EscrowCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const {
    confirmReceipt,
    raiseDispute,
    resolveDispute,
    recieveFunds,
    isLoading,
  } = useContract();
  const created = new Date(escrow.created_at);
  const timeoutDate = new Date(created.getTime() + escrow.timeout * 1000);
  const [showConfirmReceipt, setShowConfirmReceipt] = useState(false);
  const [showClaimFunds, setShowClaimFunds] = useState(false);

  const handleConfirmReceipt = () => {
    setShowConfirmReceipt(true);
  };

  const statusConfig = {
    active: {
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
      label: "Active",
    },
    pending: {
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      label: "Pending",
    },
    completed: {
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
      label: "Completed",
    },
    disputed: {
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "Disputed",
    },
    refunded: {
      icon: XCircle,
      color: "text-muted-foreground",
      bg: "bg-muted",
      label: "Refunded",
    },
  };

  const getDaysLeft = (escrow: Escrow) => {
    const createdAtMs = new Date(escrow.created_at).getTime();
    const timeoutMs = escrow.timeout * 1000; // Convert timeout seconds to ms
    const deadline = createdAtMs + timeoutMs;

    const nowMs = Date.now();
    const remainingMs = deadline - nowMs;

    // Convert milliseconds to days (1000ms * 60s * 60m * 24h)
    const daysRemaining = remainingMs / (1000 * 60 * 60 * 24);

    // Use Math.max(..., 0) so it doesn't return negative days if expired
    return Math.max(daysRemaining, 0);
  };

  const calculateProgress = (escrow: Escrow) => {
    const createdAtSeconds = new Date(escrow.created_at).getTime() / 1000;
    const nowSeconds = Date.now() / 1000;

    const elapsed = nowSeconds - createdAtSeconds;
    const totalDuration = escrow.timeout;

    // Calculate percentage
    let percentage = (elapsed / totalDuration) * 100;

    // Final progress value
    return Math.min(Math.max(percentage, 0), 100);
  };

  const status = statusConfig[escrow.status];
  const StatusIcon = status.icon;
  const progress = calculateProgress(escrow);
  let daysLeft = getDaysLeft(escrow);
  let minutesLeft = Math.ceil(daysLeft * 24 * 60);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleRaiseDispute = async () => {
    const success = await raiseDispute(
      Number.parseInt(escrow.id),
      disputeReason,
      Number(escrow.listing_id),
    );
    if (success) {
      setShowDispute(false);
      setDisputeReason("");
      onStateChange();
    }
  };

  const handleResolveDispute = async (winner: "buyer" | "seller") => {
    const success = await resolveDispute(
      Number.parseInt(escrow.id),
      winner === "seller",
      Number(escrow.listing_id),
    );
    if (success) {
      setShowResolve(false);
      setResolutionNote("");
      onStateChange();
    }
  };

  const handleAutoRelease = async () => {
    await recieveFunds(Number.parseInt(escrow.id), Number(escrow.listing_id));
    onStateChange();
  };

  const release = async () => {
    await confirmReceipt(Number.parseInt(escrow.id), Number(escrow.listing_id));
    onStateChange();
  };

  const handleClaimFunds = () => {
    setShowClaimFunds(true);
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${status.bg} ${status.color} border-0`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {escrow.role}
                </Badge>
              </div>
              <h3 className="text-xl font-semibold mb-1">
                {escrow.listing_title}
              </h3>
              <p className="text-sm text-muted-foreground">
                Escrow ID: {escrow.id}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ${escrow.amount} <span className="text-xs">in MNEE</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Escrowed Amount
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Countdown */}
          {escrow.status === "pending" && (
            <div className="space-y-2">
              {minutesLeft != 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Time until auto-release
                    </span>
                    <span className="font-medium">
                      {daysLeft < 1 ? (
                        <>
                          {minutesLeft}{" "}
                          {minutesLeft === 1 ? "minute" : "minutes"} left
                        </>
                      ) : (
                        <>
                          {Math.floor(daysLeft)}{" "}
                          {daysLeft === 1 ? "day" : "days"} left
                        </>
                      )}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </>
              )}
              {minutesLeft == 0 && (
                <div className="flex items-center gap-2 text-xs text-green-500 font-medium mt-2">
                  <CheckCircle className="h-4 w-4" />
                  Ready to claim
                </div>
              )}
            </div>
          )}

          {/* Dispute Notice */}
          {escrow.status === "disputed" && escrow.dispute_reason && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">
                    Dispute Active
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {escrow.dispute_reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Buyer</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-xs bg-secondary px-2 py-1 rounded">
                  {truncateAddress(escrow.buyer_address)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-6 w-6 p-0"
                >
                  <a
                    href={`https://etherscan.io/address/${escrow.buyer_address}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Seller</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-xs bg-secondary px-2 py-1 rounded">
                  {truncateAddress(escrow.seller_address)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-6 w-6 p-0"
                >
                  <a
                    href={`https://etherscan.io/address/${escrow.seller_address}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Scale className="h-3 w-3" />
                <span>Arbiter</span>
              </div>
              <div>
                <div className="text-xs font-medium">{escrow.arbiter_name}</div>
                <code className="text-xs text-muted-foreground">
                  {truncateAddress(escrow.arbiter_address)}
                </code>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-2 pt-0 md:grid-cols-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(true)}
            className="bg-transparent text-primary col-span-2 md:col-span-1"
          >
            View Details
          </Button>

          {/* Buyer Actions */}
          {escrow.role === "buyer" && escrow.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={handleConfirmReceipt}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="text-primary-foreground" />
                    Processing...
                  </>
                ) : (
                  "Release Funds"
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDispute(true)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="text-secondary-foreground" />
                    Processing...
                  </>
                ) : (
                  "Raise Dispute"
                )}
              </Button>
            </>
          )}

          {/* Seller Actions */}
          {escrow.role === "seller" &&
            escrow.status === "pending" &&
            progress < 100 && (
              <Button size="sm" disabled className="col-span-2">
                Awaiting Confirmation
              </Button>
            )}

          {escrow.role === "seller" &&
            progress >= 100 &&
            escrow.status === "pending" && (
              <Button
                size="sm"
                onClick={handleClaimFunds}
                disabled={isLoading}
                className="col-span-2"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="text-primary-foreground" />
                    Processing...
                  </>
                ) : (
                  "Claim Funds"
                )}
              </Button>
            )}

          {/* Arbiter Actions */}
          {escrow.role === "arbiter" && escrow.status === "disputed" && (
            <Button
              size="sm"
              onClick={() => setShowResolve(true)}
              disabled={isLoading}
              className="col-span-2"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-primary-foreground" />
                  Processing...
                </>
              ) : (
                "Resolve Dispute"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-card border-border mx-auto">
          <DialogHeader>
            <DialogTitle>{escrow.listing_title}</DialogTitle>
            <DialogDescription>Escrow details and terms</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Contact Landlord</h4>
              <p className="text-sm text-muted-foreground flex items-center">
                <Phone className="h-3 w-3 text-primary mr-1" />
                <span>{escrow.listings.contact}</span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Terms & Conditions</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {escrow.terms}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>{" "}
                <span className="font-medium">
                  {created.toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Timeout:</span>{" "}
                <span className="font-medium">
                  {timeoutDate.toLocaleDateString()}{" "}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetails(false)}
              className="text-primary bg-transparent"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDispute} onOpenChange={setShowDispute}>
        <DialogContent className="bg-card border-border mx-auto">
          <DialogHeader>
            <DialogTitle>Raise Dispute</DialogTitle>
            <DialogDescription>
              Explain the issue to the arbiter for resolution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dispute-reason">Dispute Reason</Label>
              <Textarea
                id="dispute-reason"
                placeholder="Describe the issue in detail..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={5}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDispute(false)}
              disabled={isLoading}
              className="text-primary bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRaiseDispute}
              disabled={!disputeReason.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-primary-foreground" />
                  Submitting...
                </>
              ) : (
                "Submit Dispute"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolve} onOpenChange={setShowResolve}>
        <DialogContent className="bg-card border-border mx-auto">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Make a decision on who should receive the funds
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resolution-note">Resolution Note</Label>
              <Textarea
                id="resolution-note"
                placeholder="Explain your decision..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-transparent text-primary"
                variant="outline"
                onClick={() => handleResolveDispute("buyer")}
                disabled={!resolutionNote.trim() || isLoading}
              >
                {isLoading ? "Processing..." : "Release to Buyer"}
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleResolveDispute("seller")}
                disabled={!resolutionNote.trim() || isLoading}
              >
                {isLoading ? "Processing..." : "Release to Seller"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmReceiptModal
        isOpen={showConfirmReceipt}
        onClose={() => setShowConfirmReceipt(false)}
        onConfirm={release}
        listingTitle={escrow.listing_title}
        isLoading={isLoading}
      />

      <ConfirmClaimFundsModal
        isOpen={showClaimFunds}
        onClose={() => setShowClaimFunds(false)}
        onConfirm={handleAutoRelease}
        listingTitle={escrow.listing_title}
        amount={escrow.amount}
        isLoading={isLoading}
      />
    </>
  );
}
