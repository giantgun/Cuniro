"use client"

import type React from "react"

import { useState } from "react"
import { X, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-contract"

interface Listing {
  id: string
  title: string
  location: string
  price: string
  image: string
  seller: string
  description: string
  bedrooms: number
  bathrooms: number
}

interface CreateEscrowModalProps {
  listing: any
  isOpen: boolean
  onClose: () => void
}

// Mock arbiters - would come from smart contract in production
const arbiters = [
  { address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", name: "UniCrow Official Arbiter", fee: "2%" },
  { address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", name: "Student Housing Authority", fee: "1.5%" },
  { address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", name: "Community Mediator", fee: "1%" },
]

export function CreateEscrowModal({ listing, isOpen, onClose }: CreateEscrowModalProps) {
  const [terms, setTerms] = useState("")
  const [timeout, setTimeout] = useState("14")
  const [selectedArbiter, setSelectedArbiter] = useState("")
  const { toast } = useToast()
  const { isConnected, account, userId } = useWallet()
  const { createEscrow, isLoading } = useContract()

  if (!isOpen) return null

  const platformFee = "0.5%"
  const selectedArbiterData = arbiters.find((a) => a.address === selectedArbiter)
  const arbiterFee = selectedArbiterData?.fee || "0%"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create an escrow",
      })
      return
    }

    const escrowId = await createEscrow(listing.seller, selectedArbiter, listing.price, Number.parseInt(timeout), terms, listing.title, Number.parseInt(listing.id), selectedArbiterData?.name!)

    if (escrowId) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-card border border-border rounded-lg max-w-2xl w-full my-8 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Create Escrow</h2>
            <p className="text-sm text-muted-foreground mt-1">Set up secure payment for your rental</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {!isConnected && (
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="pt-4 pb-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Wallet Not Connected</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Please connect your wallet to create an escrow contract.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Listing Summary */}
            <Card className="bg-secondary/30 border-border">
              <CardContent className="pt-4 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground">{listing.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">${listing.price} <div className="text-xs">in MNEE</div></div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-filled Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="seller" className="text-sm font-medium">
                  Landlord Address
                </Label>
                <Input id="seller" value={listing.seller || listing.profiles.address} disabled className="mt-1.5 bg-secondary/50" />
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm font-medium">
                  Escrow Amount (MNEE)
                </Label>
                <Input id="amount" value={listing.price} disabled className="mt-1.5 bg-secondary/50" />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <Label htmlFor="terms" className="text-sm font-medium">
                Terms & Conditions
                <span className="text-destructive ml-1">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2 leading-relaxed">
                Describe the rental terms and landlord conditions. This information will help the arbiter make decisions
                in case of disputes.
              </p>
              <Textarea
                id="terms"
                placeholder="Example: First month's rent as deposit. Move-in date: Jan 15, 2025. Apartment must be as shown in photos. WiFi and utilities included. No smoking policy..."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                required
                rows={5}
                className="mt-1.5 resize-none"
              />
            </div>

            {/* Timeout Period */}
            <div>
              <Label htmlFor="timeout" className="text-sm font-medium">
                Auto-Release Timeout
                <span className="text-destructive ml-1">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Funds automatically release to landlord after this period if no disputes arise
              </p>
              <Select value={timeout} onValueChange={setTimeout} required>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select timeout period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days (Recommended)</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Arbiter Selection */}
            <div>
              <Label htmlFor="arbiter" className="text-sm font-medium">
                Select Arbiter
                <span className="text-destructive ml-1">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Independent party who will resolve disputes if they arise
              </p>
              <Select value={selectedArbiter} onValueChange={setSelectedArbiter} required>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose an arbiter" />
                </SelectTrigger>
                <SelectContent>
                  {arbiters.map((arbiter) => (
                    <SelectItem key={arbiter.address} value={arbiter.address}>
                      <div className="flex flex-col">
                        <span className="font-medium">{arbiter.name}</span>
                        <span className="text-xs font-light">
                          Fee: {arbiter.fee} • {arbiter.address.slice(0, 10)}...
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fee Summary */}
            <Card className="bg-muted/30 border-border">
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Fee Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-medium">{platformFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arbiter Fee</span>
                    <span className="font-medium">{arbiterFee}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold">Total Fees</span>
                    <span className="font-semibold text-primary">
                      {selectedArbiter
                        ? `${Number.parseFloat(platformFee) + Number.parseFloat(arbiterFee)}%`
                        : platformFee}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Release Notice */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Automatic Release</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      After {timeout} days, if no dispute is raised, funds will automatically be released to the
                      landlord. Make sure to inspect the property and raise any issues before the timeout expires.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedArbiter || !terms || !isConnected}>
              {isLoading ? "Creating Escrow..." : "Create Escrow"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
