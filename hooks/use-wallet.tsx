"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { supabase } from "./supabase"

interface WalletContextType {
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => void
  switchChain: (targetChainId: number) => Promise<void>
  provider?: ethers.BrowserProvider
  signer?: ethers.JsonRpcSigner
  userId?: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  // Check if wallet is already connected on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0])
            return window.ethereum.request({ method: "eth_chainId" })
          }
        })
        .then((chainId: string) => {
          if (chainId) {
            setChainId(Number.parseInt(chainId, 16))
          }
        })
        .catch((error: any) => {
          console.error("Error checking wallet connection:", error)
        })
    }
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          toast({
            title: "Account Changed",
            description: `Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          })
        } else {
          setAccount(null)
          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected",
          })
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
        toast({
          title: "Network Changed",
          description: `Switched to chain ID ${Number.parseInt(chainId, 16)}`,
        })
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [toast])

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        variant: "destructive",
        title: "No Wallet Found",
        description: "Please install MetaMask or another Web3 wallet",
      })
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // BrowserProvider replaces providers.Web3Provider
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const { error, data } = await supabase.auth.signInWithWeb3({
        chain: 'ethereum',
        statement: 'I accept the Terms of Service at https://example.com/tos',
        wallet: accounts[0],
      })

      if (data.user) {
        setUserId(data.user.id)
        console.log("Supabase authenticated user ID:", data.user.id)
        const { data: addressData, error: addressError } = await supabase.from('profiles').select("address").eq("id", data.user.id).single()
        if (addressError) {
          console.error("Error fetching user address from Supabase:", addressError)
          throw addressError
        }
        if (addressData.address !== accounts[0]) {
          const { error: updateError, data: updateData } = await supabase.from('profiles').update({ address: accounts[0] }).eq('id', data.user.id)
          if (updateError) {
            console.error("Error updating user address in Supabase:", updateError)
            throw updateError
          }
        }
      }

      if (error) {
        throw error
      }

      setProvider(provider)
      setSigner(signer)

      if (accounts.length > 0) {
        setAccount(accounts[0].toLowerCase())
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(Number.parseInt(chainId, 16))

        toast({
          variant: "success",
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setChainId(null)
    setProvider(null)
    setSigner(null)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const switchChain = async (targetChainId: number) => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        variant: "destructive",
        title: "No Wallet Found",
        description: "Please install MetaMask or another Web3 wallet",
      })
      return
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })

      toast({
        variant: "success",
        title: "Network Switched",
        description: `Switched to chain ID ${targetChainId}`,
      })
    } catch (error: any) {
      if (error.code === 4902) {
        toast({
          variant: "destructive",
          title: "Network Not Found",
          description: "This network is not configured in your wallet",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Switch Failed",
          description: error.message || "Failed to switch network",
        })
      }
    }
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected: !!account,
        isConnecting,
        chainId,
        connect,
        disconnect,
        switchChain,
        provider: provider || undefined,
        signer: signer || undefined,
        userId: userId || undefined,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
