"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EscrowCard, Escrow } from "@/components/escrow-card";
import { useContract } from "@/hooks/use-contract";
import { useWallet } from "@/hooks/use-wallet";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/hooks/supabase";

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
    terms:
      "Security deposit required. Move-in date: Feb 1, 2025. Shared kitchen and living room.",
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
    terms:
      "First and last month rent. Move-in date: Dec 15, 2024. Shared facilities with 3 other students.",
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
    terms:
      "Premium apartment with parking. Move-in date: Feb 15, 2025. 24/7 security included.",
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
    terms:
      "Studio apartment with desk. Move-in date: Jan 25, 2025. Utilities included.",
    disputeReason:
      "Apartment condition does not match listing photos. WiFi not working as promised.",
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
    terms:
      "Large room in shared house. Move-in date: Feb 5, 2025. Pet-friendly with garden access.",
    listingId: 6,
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("buyer");
  const [data, setData] = useState<any[] | null>([]);
  const { account, userId, autoDisconnect } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(false);
  const { toast } = useToast();

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

  const buyerEscrows = [
    ...(data ?? [])
      .filter((escrow) => escrow.buyer_address.toLowerCase() === account)
      .map((escrow) => ({ ...escrow, role: "buyer" })),
  ].sort((e1, e2) => {
    if (
      (e1.status === "pending" || e1.status === "disputed") &&
      !(e2.status === "pending" || e2.status === "disputed")
    )
      return -1; // 'a' passes, moves up
    if (
      !(e1.status === "pending" || e1.status === "disputed") &&
      (e2.status === "pending" || e2.status === "disputed")
    )
      return 1; // 'b' passes, moves up
    return 0; // same condition, no change
  });

  const sellerEscrows = [
    ...(data ?? [])
      .filter((escrow) => escrow.seller_address.toLowerCase() === account)
      .map((escrow) => ({ ...escrow, role: "seller" })),
  ].sort((e1, e2) => {
    if (
      calculateProgress(e1) === 100 &&
      e1.status === "pending" &&
      !(calculateProgress(e2) === 100 && e2.status === "pending")
    )
      return -1; // 'a' passes, moves up
    if (
      !(calculateProgress(e1) === 100 && e1.status === "pending") &&
      calculateProgress(e2) === 100 &&
      e2.status === "pending"
    )
      return 1; // 'b' passes, moves up
    return 0; // same condition, no change
  });

  const arbiterEscrows = [
    ...(data ?? [])
      .filter((escrow) => escrow.arbiter_address.toLowerCase() === account)
      .map((escrow) => ({ ...escrow, role: "arbiter" })),
  ].sort((e1, e2) => {
    if (e1.status === "disputed" && !(e2.status === "disputed")) return -1; // 'a' passes, moves up
    if (!(e1.status === "disputed") && e2.status === "disputed") return 1; // 'b' passes, moves up
    return 0; // same condition, no change
  });

  const buyerNotifications = buyerEscrows.filter(
    (escrow: Escrow) => escrow.status === "pending",
  ).length;

  const sellerNotifications =
    sellerEscrows.filter(
      (escrow: Escrow) =>
        calculateProgress(escrow) === 100 && escrow.status === "pending",
    ).length || 0;

  const arbiterNotifications = arbiterEscrows.filter(
    (escrow: Escrow) => escrow.status === "disputed",
  ).length;

  const { getAllUserEscrows } = useContract();

  const onStateChange = async () => {
    setReloadFlag(!reloadFlag);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          autoDisconnect();
          throw userError;
        }
        const result = await getAllUserEscrows();
        setData(result);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (account != null) {
      fetchData();
    }
  }, [account, userId, reloadFlag]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Escrow Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your escrows, track status, and take actions
              </p>
            </div>
          </div>

          {!account && !isLoading && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">
                Connect your wallet to manage your escrows.
              </p>
            </div>
          )}

          {account && !isLoading && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                <TabsTrigger value="buyer" className="relative">
                  My Escrows
                  {buyerNotifications > 0 && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                      {buyerNotifications > 0 && buyerNotifications}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="seller" className="relative">
                  As Seller
                  {sellerNotifications > 0 && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                      {sellerNotifications > 0 && sellerNotifications}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="arbiter" className="relative">
                  As Arbiter
                  {arbiterNotifications > 0 && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                      {arbiterNotifications > 0 && arbiterNotifications}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buyer" className="space-y-6">
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    Escrows where you are the tenant (buyer)
                  </p>
                </div>
                {buyerEscrows.length > 0 ? (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {buyerEscrows.map((escrow) => (
                      <EscrowCard
                        onStateChange={onStateChange}
                        key={escrow.id}
                        escrow={escrow}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">
                      You do not have any escrows as a potential tenant
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="seller" className="space-y-6">
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    Escrows where you are the landlord (seller)
                  </p>
                </div>
                {sellerEscrows.length > 0 ? (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {sellerEscrows.map((escrow) => (
                      <EscrowCard
                        onStateChange={onStateChange}
                        key={escrow.id}
                        escrow={escrow}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">
                      You do not have any escrows as a landlord or agent
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="arbiter" className="space-y-6">
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    Escrows where you are the neutral arbiter
                  </p>
                </div>
                {arbiterEscrows.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {arbiterEscrows.map((escrow) => (
                      <EscrowCard
                        onStateChange={onStateChange}
                        key={escrow.id}
                        escrow={escrow}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">
                      You do not have any escrows as an arbiter
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {isLoading && <Spinner size="lg" className="mx-auto my-4" />}
        </div>
      </div>
    </div>
  );
}
