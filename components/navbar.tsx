"use client";

import Link from "next/link";
import { Menu, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/use-wallet";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export function Navbar() {
  const { account, isConnected, isConnecting, connect, disconnect } =
    useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <span className="text-primary-foreground font-bold text-lg">
                C
              </span>
            </div>
            <span className="text-xl font-semibold">Cuniro</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/listings"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/manage-listings"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Manage Listings
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Button
                variant="outline"
                onClick={disconnect}
                className="hidden sm:flex bg-transparent"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {truncateAddress(account!)}
              </Button>
            ) : (
              <Button
                onClick={connect}
                disabled={isConnecting}
                className="hidden sm:flex"
              >
                {isConnecting ? (
                  <Spinner size="sm" className="mr-2 text-primary-foreground" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            <DropdownMenu onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/listings">Browse</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/manage-listings">Manage Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                {isConnected ? (
                  <>
                    <DropdownMenuItem className="sm:hidden">
                      <Wallet className="mr-2 h-4 w-4" />
                      {truncateAddress(account!)}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={disconnect}>
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={connect} disabled={isConnecting}>
                    {isConnecting ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      <Wallet className="mr-2 h-4 w-4" />
                    )}
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
