"use client"

import Image from "next/image"
import { MapPin, Bed, Bath, ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CreateEscrowModal } from "@/components/create-escrow-modal"
import { useWallet } from "@/hooks/use-wallet"

interface Listing {
  id: string
  title: string
  location: string
  price: string
  image_url: string
  profiles: { address: string }
  description: string
  bedrooms: number
  bathrooms: number
}

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const [showEscrowModal, setShowEscrowModal] = useState(false)
  const { account } = useWallet();

  const truncateSeller = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      <Card className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
        <div className="relative h-48 w-full overflow-hidden">
          <Image src={listing.image_url || "/placeholder.svg"} alt={listing.title} fill className="object-cover" />
        </div>

        <CardContent className="pt-4 pb-3">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold mb-1 line-clamp-1">{listing.title}</h3>
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

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{listing.description}</p>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-2xl font-bold text-primary">${listing.price} <span className="text-xs">in MNEE</span></div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1">Landlord</div>
              <div className="flex items-center justify-between">
                <code className="text-xs bg-secondary px-2 py-1 rounded">{truncateSeller(listing.profiles.address)}</code>
                <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0" title="View on block explorer">
                  <a
                    href={`https://etherscan.io/address/${listing.profiles.address}`}
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
          <Button className="w-full" disabled={(listing.profiles.address) == account} onClick={() => setShowEscrowModal(true)}>
            {(listing.profiles.address) == account ? "You are the landlord" : "Rent with Escrow"}
          </Button>
        </CardFooter>
      </Card>

      <CreateEscrowModal listing={listing} isOpen={showEscrowModal} onClose={() => setShowEscrowModal(false)} />
    </>
  )
}
