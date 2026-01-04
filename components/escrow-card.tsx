"use client"

import { useState } from "react"
import { Clock, AlertCircle, CheckCircle, XCircle, User, Scale, ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useContract } from "@/hooks/use-contract"

export interface Escrow {
  id: string
  listing_title: string
  amount: string
  status: "active" | "pending" | "completed" | "disputed" | "refunded"
  role: "buyer" | "seller" | "arbiter"
  seller_address: string
  buyer_address: string
  arbiter_address: string
  arbiter_name: string
  created_at: string
  timeout: number
  daysLeft: number
  terms: string
  dispute_reason?: string
  listing_id: number
}

interface EscrowCardProps {
  escrow: Escrow
}

export function EscrowCard({ escrow }: EscrowCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showDispute, setShowDispute] = useState(false)
  const [showResolve, setShowResolve] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")
  const [resolutionNote, setResolutionNote] = useState("")
  const { confirmReceipt, raiseDispute, resolveDispute, recieveFunds, isLoading } = useContract()

  const statusConfig = {
    active: { icon: Clock, color: "text-primary", bg: "bg-primary/10", label: "Active" },
    pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Pending" },
    completed: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "Completed" },
    disputed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Disputed" },
    refunded: { icon: XCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Refunded" },
  }

  const status = statusConfig[escrow.status]
  const StatusIcon = status.icon
  const progress = ((escrow.timeout - escrow.daysLeft) / escrow.timeout) * 100

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleRaiseDispute = async () => {
    const success = await raiseDispute(Number.parseInt(escrow.id), disputeReason, Number(escrow.listing_id))
    if (success) {
      setShowDispute(false)
      setDisputeReason("")
    }
  }

  const handleResolveDispute = async (winner: "buyer" | "seller") => {
    const success = await resolveDispute(Number.parseInt(escrow.id), (winner === "seller"), Number(escrow.listing_id))
    if (success) {
      setShowResolve(false)
      setResolutionNote("")
    }
  }

  const handleAutoRelease = async () => {
    await recieveFunds(Number.parseInt(escrow.id), Number(escrow.listing_id))
  }

  const handleConfirmReceipt = async () => {
    await confirmReceipt(Number.parseInt(escrow.id), Number(escrow.listing_id))
  }

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
              <h3 className="text-xl font-semibold mb-1">{escrow.listing_title}</h3>
              <p className="text-sm text-muted-foreground">Escrow ID: {escrow.id}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">${escrow.amount} <span className="text-xs">in MNEE</span></div>
              <div className="text-xs text-muted-foreground">Escrowed Amount</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Countdown */}
          {escrow.status === "active" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time until auto-release</span>
                <span className="font-medium">
                  {escrow.daysLeft} {escrow.daysLeft === 1 ? "day" : "days"} left
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Dispute Notice */}
          {escrow.status === "disputed" && escrow.dispute_reason && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">Dispute Active</p>
                  <p className="text-xs text-muted-foreground">{escrow.dispute_reason}</p>
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
                <code className="text-xs bg-secondary px-2 py-1 rounded">{truncateAddress(escrow.buyer_address)}</code>
                <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0">
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
                <code className="text-xs bg-secondary px-2 py-1 rounded">{truncateAddress(escrow.seller_address)}</code>
                <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0">
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
                <code className="text-xs text-muted-foreground">{truncateAddress(escrow.arbiter_address)}</code>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 pt-0">
          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)} className="bg-transparent">
            View Details
          </Button>

          {/* Buyer Actions */}
          {escrow.role === "buyer" && escrow.status === "active" && (
            <>
              <Button size="sm" onClick={handleConfirmReceipt} disabled={isLoading}>
                {isLoading ? "Processing..." : "Confirm Receipt"}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDispute(true)} disabled={isLoading}>
                Raise Dispute
              </Button>
            </>
          )}

          {/* Seller Actions */}
          {escrow.role === "seller" && escrow.status === "active" && (
            <Button size="sm" disabled>
              Awaiting Buyer Confirmation
            </Button>
          )}

          {escrow.role === "seller" && escrow.status === "pending" && (
            <Button size="sm" onClick={handleAutoRelease}>
              Recieve Funds
            </Button>
          )}

          {/* Arbiter Actions */}
          {escrow.role === "arbiter" && escrow.status === "disputed" && (
            <Button size="sm" onClick={() => setShowResolve(true)} disabled={isLoading}>
              Resolve Dispute
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{escrow.listing_title}</DialogTitle>
            <DialogDescription>Escrow details and terms</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Terms & Conditions</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{escrow.terms}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>{" "}
                <span className="font-medium">{escrow.created_at}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Timeout:</span>{" "}
                <span className="font-medium">{escrow.timeout} days</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDispute} onOpenChange={setShowDispute}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Dispute</DialogTitle>
            <DialogDescription>Explain the issue to the arbiter for resolution</DialogDescription>
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
            <Button variant="outline" onClick={() => setShowDispute(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRaiseDispute} disabled={!disputeReason.trim() || isLoading}>
              {isLoading ? "Submitting..." : "Submit Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolve} onOpenChange={setShowResolve}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>Make a decision on who should receive the funds</DialogDescription>
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
                className="flex-1 bg-transparent"
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
    </>
  )
}
