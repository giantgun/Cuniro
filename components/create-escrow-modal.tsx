"use client";

import type React from "react";

import { useState } from "react";
import { X, AlertCircle, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { useContract } from "@/hooks/use-contract";
import { Spinner } from "./ui/spinner";

interface Listing {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  seller: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
}

interface CreateEscrowModalProps {
  listing: any;
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}

// Mock arbiters - would come from smart contract in production
const defaultArbiters = [
  {
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    name: "UniCrow Official Arbiter",
  },
  {
    address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    name: "Student Housing Authority",
  },
  {
    address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    name: "Community Mediator",
  },
];

export function CreateEscrowModal({
  listing,
  isOpen,
  onClose,
  onCreate,
}: CreateEscrowModalProps) {
  const [terms, setTerms] = useState("");
  const [timeout, setTimeout] = useState("14");
  const [selectedArbiter, setSelectedArbiter] = useState("");
  const { toast } = useToast();
  const { isConnected } = useWallet();
  const { createEscrow, isLoading } = useContract();
  const minutes = Number(timeout) * 24 * 60;
  const [arbiters, setArbiters] = useState(defaultArbiters);
  const [showAddArbiterModal, setShowAddArbiterModal] = useState(false);
  const [newArbiterName, setNewArbiterName] = useState("");
  const [newArbiterAddress, setNewArbiterAddress] = useState("");

  if (!isOpen) return null;

  const selectedArbiterData = arbiters.find(
    (a) => a.address === selectedArbiter,
  );

  const handleAddArbiter = () => {
    if (!newArbiterName.trim() || !newArbiterAddress.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please enter arbiter name, address, and fee",
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newArbiterAddress)) {
      toast({
        variant: "destructive",
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address (0x...)",
      });
      return;
    }

    const newArbiter = {
      address: newArbiterAddress,
      name: newArbiterName,
    };

    setArbiters([...arbiters, newArbiter]);
    setNewArbiterName("");
    setNewArbiterAddress("");
    setShowAddArbiterModal(false);

    toast({
      title: "Arbiter Added",
      description: `${newArbiterName} has been added to the list`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create an escrow",
      });
      return;
    }

    const escrowId = await createEscrow(
      listing.profiles.address,
      selectedArbiter,
      listing.price,
      Number.parseInt(`${Number(timeout) * 60 * 60 * 24}`),
      terms,
      listing.title,
      Number.parseInt(listing.id),
      selectedArbiterData?.name!,
    );

    if (escrowId) {
      onClose();
    }
  };

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
            <p className="text-sm text-muted-foreground mt-1">
              Set up secure payment for your rental
            </p>
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
                      <p className="text-sm font-medium">
                        Wallet Not Connected
                      </p>
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
                    <p className="text-sm text-muted-foreground">
                      {listing.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      ${listing.price} <div className="text-xs">in MNEE</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per month
                    </div>
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
                <Input
                  id="seller"
                  value={listing.profiles.address}
                  disabled
                  className="mt-1.5 bg-secondary/50"
                />
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm font-medium">
                  Escrow Amount ($)
                </Label>
                <Input
                  id="amount"
                  value={listing.price}
                  disabled
                  className="mt-1.5 bg-secondary/50"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <Label htmlFor="terms" className="text-sm font-medium">
                Terms & Conditions
                <span className="text-destructive ml-1">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2 leading-relaxed">
                Describe the rental terms and landlord conditions. This
                information will help the arbiter make decisions in case of
                disputes.
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
                Funds automatically release to landlord after this period if no
                disputes arise
              </p>
              <Select value={timeout} onValueChange={setTimeout} required>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select timeout period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.00139">2 minutes</SelectItem>
                  <SelectItem value="0.00347">5 minutes</SelectItem>
                  <SelectItem value="0.00694">10 minutes</SelectItem>
                  <SelectItem value="0.0208333">30 minutes</SelectItem>
                  <SelectItem value="0.041666666666667 ">1 hour</SelectItem>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days (Recommended)</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Arbiter Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="arbiter" className="text-sm font-medium">
                  Select Arbiter
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddArbiterModal(true)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Independent party who will resolve disputes if they arise
              </p>
              <Select
                value={selectedArbiter}
                onValueChange={setSelectedArbiter}
                required
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose an arbiter" />
                </SelectTrigger>
                <SelectContent>
                  {arbiters.map((arbiter) => (
                    <SelectItem key={arbiter.address} value={arbiter.address}>
                      <div className="flex flex-col">
                        <span className="font-medium">{arbiter.name}</span>
                        <span className="text-xs font-light">
                          Fee: 1 • {arbiter.address.slice(0, 10)}...
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
                    <span className="font-medium">0.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Arbiter Fee</span>
                      <span className="text-xs text-muted-foreground/70">
                        Only if dispute raised
                      </span>
                    </div>
                    <span className="font-medium">1%</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold">Total Fees</span>
                    <span className="font-semibold text-primary">1.1%</span>
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
                      After{" "}
                      {Number(timeout) < 1
                        ? `${Math.round(minutes)} minutes`
                        : `${timeout} days`}
                      , if no dispute is raised, funds will automatically be
                      claimable by the landlord. Make sure to inspect the
                      property and raise any issues before the timeout expires.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-primary bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedArbiter || !terms || !isConnected}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-primary-foreground" />
                  Creating Escrow...
                </>
              ) : (
                "Create Escrow"
              )}
            </Button>
          </div>
        </form>
      </div>
      {showAddArbiterModal && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex m-auto justify-center p-2 lg:p-4">
          <Card className="w-full max-w-sm max-h-[72vh]">
            <div className="flex items-center justify-between px-6 pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold">Add New Arbiter</h3>
                <p className="text-xs text-muted-foreground">
                  This is a test only feature, listed arbiters are to be
                  verified by platform.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddArbiterModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="px-6 pb-3 space-y-2">
              <div>
                <Label htmlFor="arbiter-name" className="text-sm font-medium">
                  Arbiter Name
                </Label>
                <Input
                  id="arbiter-name"
                  placeholder="e.g., Community Arbitration Service"
                  value={newArbiterName}
                  onChange={(e) => setNewArbiterName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="arbiter-address"
                  className="text-sm font-medium"
                >
                  Arbiter Address
                </Label>
                <Input
                  id="arbiter-address"
                  placeholder="0x..."
                  value={newArbiterAddress}
                  onChange={(e) => setNewArbiterAddress(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Valid Ethereum address starting with 0x
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddArbiterModal(false)}
                  className="text-primary bg-transparent flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddArbiter}
                  className="flex-1"
                >
                  Add Arbiter
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
