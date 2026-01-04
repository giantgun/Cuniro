"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EscrowCard, Escrow } from "@/components/escrow-card"
import { useContract } from "@/hooks/use-contract"
import { useWallet } from "@/hooks/use-wallet"
import { set } from "react-hook-form"

// Mock escrow data - would come from blockchain in production
const mockEscrows = [
  {
    id: "escrow-001",
    listingTitle: "Modern Studio Near Campus",
    amount: "850",
    status: "active",
    role: "buyer",
    seller: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    buyer: "0x1234567890123456789012345678901234567890",
    arbiter: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    arbiterName: "UniCrow Official Arbiter",
    createdAt: "2025-01-15",
    timeout: 14,
    daysLeft: 12,
    terms:
      "First month's rent as deposit. Move-in date: Jan 30, 2025. Apartment must be as shown in photos. WiFi and utilities included.",
    listingId: 1,
  },
  {
    id: "escrow-002",
    listingTitle: "Shared 2BR Apartment",
    amount: "600",
    status: "pending",
    role: "buyer",
    seller: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    buyer: "0x1234567890123456789012345678901234567890",
    arbiter: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    arbiterName: "Student Housing Authority",
    createdAt: "2025-01-20",
    timeout: 7,
    daysLeft: 5,
    terms: "Security deposit required. Move-in date: Feb 1, 2025. Shared kitchen and living room.",
    listingId: 2,
  },
  {
    id: "escrow-003",
    listingTitle: "Private Room in Student House",
    amount: "500",
    status: "completed",
    role: "buyer",
    seller: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    buyer: "0x1234567890123456789012345678901234567890",
    arbiter: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    arbiterName: "Community Mediator",
    createdAt: "2024-12-01",
    timeout: 14,
    daysLeft: 0,
    terms: "First and last month rent. Move-in date: Dec 15, 2024. Shared facilities with 3 other students.",
    listingId: 2,
  },
  {
    id: "escrow-004",
    listingTitle: "Luxury 1BR with Balcony",
    amount: "1200",
    status: "active",
    role: "seller",
    seller: "0x1234567890123456789012345678901234567890",
    buyer: "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
    arbiter: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    arbiterName: "UniCrow Official Arbiter",
    createdAt: "2025-01-18",
    timeout: 30,
    daysLeft: 28,
    terms: "Premium apartment with parking. Move-in date: Feb 15, 2025. 24/7 security included.",
    listingId: 4,
  },
  {
    id: "escrow-005",
    listingTitle: "Cozy Studio with Study Space",
    amount: "700",
    status: "disputed",
    role: "arbiter",
    seller: "0x123463a4B065722E99115D6c222f267d9cABb524",
    buyer: "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
    arbiter: "0x1234567890123456789012345678901234567890",
    arbiterName: "You",
    createdAt: "2025-01-10",
    timeout: 14,
    daysLeft: 8,
    terms: "Studio apartment with desk. Move-in date: Jan 25, 2025. Utilities included.",
    disputeReason: "Apartment condition does not match listing photos. WiFi not working as promised.",
    listingId: 5,
  },
  {
    id: "escrow-006",
    listingTitle: "3BR House Share",
    amount: "550",
    status: "active",
    role: "arbiter",
    seller: "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
    buyer: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    arbiter: "0x1234567890123456789012345678901234567890",
    arbiterName: "You",
    createdAt: "2025-01-22",
    timeout: 14,
    daysLeft: 11,
    terms: "Large room in shared house. Move-in date: Feb 5, 2025. Pet-friendly with garden access.",
    listingId: 6,
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("buyer")
  const [data, setData] = useState<any[] | null>([])
  const { account, userId } = useWallet()

  const buyerEscrows = [...(data ?? []).filter((escrow) => escrow.buyer_address.toLowerCase() === account)
  .map((escrow) => ({ ...escrow, role: "buyer" }))]
  const sellerEscrows = [...(data ?? []).filter((escrow) => escrow.seller_address.toLowerCase() === account)
  .map((escrow) => ({ ...escrow, role: "seller" }))]
  const arbiterEscrows = [...(data ?? []).filter((escrow) => escrow.arbiter_address.toLowerCase() === account)
  .map((escrow) => ({ ...escrow, role: "arbiter" }))]
  const { getAllUserEscrows } = useContract()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAllUserEscrows()
        console.log("Result:", result);
        setData(result)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (account != null) {
      fetchData()
    }
  }, [account, userId])

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Escrow Dashboard</h1>
            <p className="text-xl text-muted-foreground">Manage your escrows, track status, and take actions</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
              <TabsTrigger value="buyer" className="relative">
                My Escrows
                {buyerEscrows.length > 0 && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                    {buyerEscrows.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="seller" className="relative">
                As Seller
                {sellerEscrows.length > 0 && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                    {sellerEscrows.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="arbiter" className="relative">
                As Arbiter
                {arbiterEscrows.length > 0 && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                    {arbiterEscrows.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buyer" className="space-y-6">
              <div className="mb-4">
                <p className="text-muted-foreground">Escrows where you are the tenant (buyer)</p>
              </div>
              {buyerEscrows.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  {buyerEscrows.map((escrow) => (
                    <EscrowCard key={escrow.id} escrow={escrow} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">No escrows found as buyer</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="seller" className="space-y-6">
              <div className="mb-4">
                <p className="text-muted-foreground">Escrows where you are the landlord (seller)</p>
              </div>
              {sellerEscrows.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  {sellerEscrows.map((escrow) => (
                    <EscrowCard key={escrow.id} escrow={escrow} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">No escrows found as seller</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="arbiter" className="space-y-6">
              <div className="mb-4">
                <p className="text-muted-foreground">Escrows where you are the neutral arbiter</p>
              </div>
              {arbiterEscrows.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  {arbiterEscrows.map((escrow) => (
                    <EscrowCard key={escrow.id} escrow={escrow} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">No escrows found as arbiter</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
