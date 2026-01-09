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
import { ChevronDown } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("buyer");
  const [data, setData] = useState<any[] | null>([]);
  const { account, userId, autoDisconnect } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(false);
  const [showCompletedBuyer, setShowCompletedBuyer] = useState(false);
  const [showCompletedSeller, setShowCompletedSeller] = useState(false);
  const [showCompletedArbiter, setShowCompletedArbiter] = useState(false);
  const { toast } = useToast();

  const separateEscrows = (escrows: Escrow[]) => ({
    active: escrows.filter(
      (e) => e.status !== "completed" && e.status !== "refunded",
    ),
    completed: escrows.filter(
      (e) => e.status === "completed" || e.status === "refunded",
    ),
  });

  const renderEscrowsWithToggle = (
    escrows: Escrow[],
    showCompleted: boolean,
    setShowCompleted: (showCompleted: boolean) => void,
  ) => {
    const { active, completed } = separateEscrows(escrows);

    return (
      <>
        {active.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {active.map((escrow) => (
              <EscrowCard
                key={escrow.id}
                escrow={escrow}
                onStateChange={onStateChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No active escrows found</p>
          </div>
        )}

        {completed.length > 0 && (
          <div className="my-8 ">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-1/4 bg-card flex items-center justify-center gap-3 p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <span className="text-sm font-medium text-primary">
                  {showCompleted ? "Hide" : "Show"}({completed.length})
                </span>
                <ChevronDown
                  className="w-4 h-4 text-primary transition-transform group-hover:text-foreground"
                  style={{
                    transform: showCompleted
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </button>
            </div>

            {showCompleted && (
              <div className="grid lg:grid-cols-2 mt-8 gap-6">
                {completed.map((escrow) => (
                  <EscrowCard
                    key={escrow.id}
                    escrow={escrow}
                    onStateChange={onStateChange}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </>
    );
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
      (e1.status === "pending" || e1.status === "disputed") &&
      !(e2.status === "pending" || e2.status === "disputed")
    )
      return -1; // 'a' passes, moves up
    if (
      !(e1.status === "pending" || e1.status === "disputed") &&
      (e2.status === "pending" || e1.status === "disputed")
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

      <div className="pt-24 pb-20 lg:px-8 md:px-6 px-4">
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
                  renderEscrowsWithToggle(
                    buyerEscrows,
                    showCompletedBuyer,
                    setShowCompletedBuyer,
                  )
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
                  renderEscrowsWithToggle(
                    sellerEscrows,
                    showCompletedSeller,
                    setShowCompletedSeller,
                  )
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
                  renderEscrowsWithToggle(
                    arbiterEscrows,
                    showCompletedArbiter,
                    setShowCompletedArbiter,
                  )
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
