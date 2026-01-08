"use client"

import type React from "react"
import { useState } from "react"
import { Droplet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { useContract } from "@/hooks/use-contract"
import { Navbar } from "@/components/navbar"

export default function FaucetPage() {
    const { account, isConnected, connect } = useWallet()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [address, setAddress] = useState("")
    const { mintMnee } = useContract()

    const validateAddress = (addr: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(addr)
    }

    const handleClaimTokens = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!address) {
            toast({
                variant: "destructive",
                title: "Address Required",
                description: "Please enter a valid Ethereum address",
            })
            return
        }

        if (!validateAddress(address)) {
            toast({
                variant: "destructive",
                title: "Invalid Address",
                description: "Please enter a valid Ethereum address (0x...)",
            })
            return
        }

        if (!account) {
            toast({
                variant: "destructive",
                title: "Wallet Not Connected",
                description: "Please connect your wallet first",
            });
            return false;
        }


        setIsLoading(true)
        try {
            await mintMnee(address);

            toast({
                variant: "success",
                title: "Tokens Claimed!",
                description: `Successfully sent 100,000 mock MNEE tokens to ${address.slice(0, 6)}...${address.slice(-4)}`,
            })

            setAddress("")
        } catch (error: any) {
            console.error()
            console.log(error.message)
            toast({
                variant: "destructive",
                title: "Claim Failed",
                description: "Failed to claim tokens. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen ">
            <Navbar/>
            <main className="pt-20 pb-12 px-4 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Droplet className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Token Faucet</h1>
                        <p className="text-muted-foreground">Get mock MNEE tokens to explore Cuniro</p>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6">
                        {/* Prerequisites */}
                        <div className="mb-6 pb-6 border-b border-border">
                            <h2 className="text-sm font-semibold text-muted-foreground tracking-wide mb-3">Steps</h2>
                            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                <li>Change your wallet network to Sepolia testnet</li>
                                <li>Connect your wallet</li>
                                <li>Obtain Sepolia ETH for gas (Google Cloud gives 0.01 for free)</li>
                                <li className="">
                                    Import the mock MNEE tokens with this address:{" "}
                                    <code className="px-1 py-0.5 rounded bg-muted text-sm">
                                        {`${process.env.NEXT_PUBLIC_MNEE_ADDRESS?.slice(0, 6)}...${process.env.NEXT_PUBLIC_MNEE_ADDRESS?.slice(-4)}`}
                                    </code>

                                    <span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    process.env.NEXT_PUBLIC_MNEE_ADDRESS ?? ""
                                                )
                                                const el = document.getElementById("copy-indicator")
                                                if (el) {
                                                    el.textContent = "Copied!"
                                                    setTimeout(() => (el.textContent = "Copy"), 1500)
                                                }
                                            }}
                                            id="copy-indicator"
                                            className="text-xs px-2 py-1 rounded border hover:bg-muted transition"
                                        >
                                            Copy address
                                        </button>
                                    </span>
                                </li>

                                <li>Copy and paste your public Sepolia ETH Address</li>
                                <li>Click Claim and confirm the transaction!</li>
                            </ul>
                        </div>

                        <form onSubmit={handleClaimTokens} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Wallet Address</label>
                                <Input
                                    type="text"
                                    placeholder="0x..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <Button type="submit" disabled={isLoading || !address} className="w-full">
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" className="mr-1 text-primary-foreground" />
                                        Claiming
                                    </>
                                ) : (
                                    "Claim 100,000 mock MNEE"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
