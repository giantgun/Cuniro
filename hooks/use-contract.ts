"use client";

import { useState, useCallback } from "react";
import { useWallet } from "./use-wallet";
import { useToast } from "./use-toast";
import { Contract } from "ethers/contract";
import { ethers } from "ethers";
import { erc20Abi } from "abitype/abis";
import { supabase } from "./supabase";

export function useContract() {
  const { account, isConnected, provider, signer } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const mneeAddress = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";
  const mneeABI = erc20Abi;
  const escrowManagerAddress = "0x2866fB299671B4C3013B3E814257ECB5510FfEed";
  const escrowManagerABI = [
    // ────────────── Constants & Public Vars ──────────────
    "function I_OWNER() view returns (address)",
    "function I_MNEE() view returns (address)",
    "function escrowCount() view returns (uint256)",

    // ────────────── Escrow Mapping Getter ──────────────
    "function escrows(uint256 id) view returns (" +
      "address buyer," +
      "address seller," +
      "address arbiter," +
      "uint256 amount," +
      "uint64 createdAt," +
      "uint64 timeout," +
      "uint8 status" +
      ")",

    // ────────────── Core Functions ──────────────
    "function createEscrow(address seller, address arbiter, uint256 amount, uint64 timeoutSeconds) returns (uint256)",
    "function release(uint256 id)",
    "function dispute(uint256 id)",
    "function autoRelease(uint256 id)",
    "function arbitrate(uint256 id, bool releaseToSeller)",

    // ────────────── Events ──────────────
    "event EscrowCreated(uint256 id, address indexed buyer, address indexed seller, address indexed arbiter, uint256 amount, uint256 timeout)",
    "event Released(uint256 indexed id)",
    "event Disputed(uint256 indexed id)",
    "event Arbitrated(uint256 indexed id, bool releasedToSeller)",
    "event AutoReleased(uint256 indexed id)",
  ];

  // Create escrow function
  const createEscrow = useCallback(
    async (
      seller: string,
      arbiter: string,
      amount: string,
      timeout: number,
      terms: string,
      listingTitle: string,
      listingId: number,
      arbiterName: string,
    ) => {
      if (!isConnected || !account) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
        });
        return null;
      }

      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const escrowManagerContract = new Contract(
          escrowManagerAddress,
          escrowManagerABI,
          signer,
        );
        const mneeContract = new Contract(mneeAddress, mneeABI, signer);
        const userAddress = account;

        // 1. Check current Balance
        let balance = await mneeContract.balanceOf(userAddress);
        balance = Number(ethers.formatUnits(`${balance}`, 18));

        if (balance < amount) {
          toast({
            variant: "destructive",
            title: "Insufficient MNEE Balance",
            description:
              "You do not have enough MNEE tokens to create this escrow",
          });
          return null;
        }
        console.log("User MNEE Balance:", `${balance}`, "amount: ", amount);

        // 2. Check existing Allowance
        const currentAllowance = await mneeContract.allowance(
          userAddress,
          escrowManagerAddress,
        );

        if (currentAllowance < amount) {
          const approveTx = await mneeContract.approve(
            escrowManagerAddress,
            ethers.parseUnits(`${amount}`, 18),
          );
          await approveTx.wait();
        }

        console.log("Creating escrow with:", {
          seller,
          arbiter,
          amount,
          timeout,
        });
        const tx = await escrowManagerContract.createEscrow(
          seller,
          arbiter,
          ethers.parseUnits(`${amount}`, 18),
          timeout,
        );
        const receipt = await tx.wait();
        let escrowId;
        if (receipt && receipt.status === 1) {
          const rawLogs = receipt.logs;

          // 3. Find and parse the specific event (e.g., 'EscrowCreated')
          const parsedLog = receipt.logs
            .map((log: any) => {
              try {
                // Returns a LogDescription object with name and args
                return escrowManagerContract.interface.parseLog(log);
              } catch (e) {
                return null; // Log was not from this contract
              }
            })
            .find((event: any) => event?.name === "EscrowCreated");
          console.log("Parsed Log: ", parsedLog);

          if (parsedLog) {
            // 4. Extract data returned from the contract
            const {
              id,
              buyer: buyerAddr,
              seller: sellerAddr,
              arbiter: arbiterAddr,
              timeout,
            } = parsedLog.args;
            escrowId = id;
            console.log(`Escrow Created - ID: ${id}, Seller: ${sellerAddr}`);
            console.log(`Slice: ${id}, Buyer: ${`${buyerAddr}`.slice(2)}`);

            //5. Update Supabase
            const { error } = await supabase.from("escrows").insert([
              {
                id: Number(escrowId),
                seller_address: `${seller}`.toLowerCase(),
                buyer_address: `${buyerAddr}`.toLowerCase(),
                arbiter_address: `${arbiter}`.toLowerCase(),
                amount: amount,
                status: "pending",
                terms: terms,
                timeout: Number(timeout),
                listing_title: listingTitle,
                listing_id: Number(listingId),
                arbiter_name: arbiterName,
              },
            ]);

            if (error) {
              console.error("Error inserting escrow into Supabase:", error);
              throw error;
            }

            const { error: listingError } = await supabase
              .from("listings")
              .update({ status: "escrowed" })
              .eq("id", Number(listingId));

            if (listingError) {
              console.error(
                "Error updating listing status in Supabase:",
                listingError,
              );
              throw listingError;
            }
          }
        }

        toast({
          variant: "success",
          title: "Escrow Created",
          description: `Escrow #${escrowId} has been created successfully`,
        });

        return escrowId; // Return mock escrow ID for now
      } catch (error: any) {
        console.error("Error creating escrow:", error);
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: "Failed to create escrow",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, account, toast],
  );

  // Confirm receipt function
  const confirmReceipt = useCallback(
    async (eId: number, listingId: number) => {
      if (!isConnected || !account) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
        });
        return false;
      }

      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const escrowManagerContract = new Contract(
          escrowManagerAddress,
          escrowManagerABI,
          signer,
        );

        const tx = await escrowManagerContract.release(eId);
        const receipt = await tx.wait();

        if (receipt && receipt.status === 1) {
          // 3. Find and parse the specific event (e.g., 'EscrowCreated')
          const parsedLog = receipt.logs
            .map((log: any) => {
              try {
                // Returns a LogDescription object with name and args
                return escrowManagerContract.interface.parseLog(log);
              } catch (e) {
                return null; // Log was not from this contract
              }
            })
            .find((event: any) => event?.name === "Released");
          console.log("Parsed Log: ", parsedLog);

          if (parsedLog) {
            //5. Update Supabase
            const { error } = await supabase
              .from("escrows")
              .update({ status: "completed" })
              .eq("id", eId);

            if (error) {
              console.error("Error updating listing status:", error);
              throw error;
            }

            const { error: updateError } = await supabase
              .from("listings")
              .update({ status: "rented" })
              .eq("id", listingId);

            if (updateError) {
              console.error("Error updating listing status:", updateError);
              throw updateError;
            }
          }
        } else {
          throw new Error(
            "Failed to parse Released event from transaction logs",
          );
        }

        toast({
          variant: "success",
          title: "Funds Released",
          description: "Funds have been released to the seller",
        });

        return true;
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: "Failed to confirm receipt",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, account, toast],
  );

  // Raise dispute function
  const raiseDispute = useCallback(
    async (eId: number, reason: string, listingId: number) => {
      if (!isConnected || !account) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
        });
        return false;
      }

      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const escrowManagerContract = new Contract(
          escrowManagerAddress,
          escrowManagerABI,
          signer,
        );

        const tx = await escrowManagerContract.dispute(eId);
        const receipt = await tx.wait();

        if (receipt && receipt.status === 1) {
          // 3. Find and parse the specific event (e.g., 'EscrowCreated')
          const parsedLog = receipt.logs
            .map((log: any) => {
              try {
                // Returns a LogDescription object with name and args
                return escrowManagerContract.interface.parseLog(log);
              } catch (e) {
                return null; // Log was not from this contract
              }
            })
            .find((event: any) => event?.name === "Disputed");
          console.log("Parsed Log: ", parsedLog);

          if (parsedLog) {
            //5. Update Supabase
            const { error } = await supabase
              .from("escrows")
              .update({ status: "disputed", dispute_reason: reason })
              .eq("id", eId);

            if (error) {
              console.error("Error updating listing status:", error);
              throw error;
            }

            const { error: updateError } = await supabase
              .from("listings")
              .update({ status: "disputed" })
              .eq("id", listingId);

            if (updateError) {
              console.error("Error updating listing status:", updateError);
              throw updateError;
            }
          } else {
            throw new Error(
              "Failed to parse Released event from transaction logs",
            );
          }
        }

        toast({
          variant: "success",
          title: "Dispute Raised",
          description: "Arbiter has been notified to review the case",
        });

        return true;
      } catch (error: any) {
        console.error("Raise dispute failed:", error);
        if (
          error.message ==
          "MetaMask Tx Signature: User denied transaction signature."
        ) {
          toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: "User rejected the transaction",
          });
          return;
        } else {
          toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: "Failed to raise dispute",
          });
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, account, toast],
  );

  // Resolve dispute function (arbiter only)
  const resolveDispute = useCallback(
    async (eId: number, sendToSeller: boolean, listingId: number) => {
      if (!isConnected || !account) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
        });
        return false;
      }

      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const escrowManagerContract = new Contract(
          escrowManagerAddress,
          escrowManagerABI,
          signer,
        );

        const tx = await escrowManagerContract.arbitrate(eId, sendToSeller);
        const receipt = await tx.wait();

        if (receipt && receipt.status === 1) {
          // 3. Find and parse the specific event (e.g., 'EscrowCreated')
          const parsedLog = receipt.logs
            .map((log: any) => {
              try {
                // Returns a LogDescription object with name and args
                return escrowManagerContract.interface.parseLog(log);
              } catch (e) {
                return null; // Log was not from this contract
              }
            })
            .find((event: any) => event?.name === "Arbitrated");
          console.log("Parsed Log: ", parsedLog);

          if (parsedLog) {
            //5. Update Supabase
            const { error } = await supabase
              .from("escrows")
              .update({ status: `${sendToSeller ? "completed" : "refunded"}` })
              .eq("id", eId);

            if (error) {
              console.error("Error updating listing status:", error);
              throw error;
            }

            const { error: updateError } = await supabase
              .from("listings")
              .update({ status: `${sendToSeller ? "rented" : "available"}` })
              .eq("id", listingId);

            if (updateError) {
              console.error("Error updating listing status:", updateError);
              throw updateError;
            }
          } else {
            throw new Error(
              "Failed to parse Released event from transaction logs",
            );
          }
        }

        toast({
          variant: "success",
          title: "Dispute Resolved",
          description: `Funds distributed: ${sendToSeller ? "100% to Seller" : "100% to Buyer"}`,
        });

        return true;
      } catch (error: any) {
        console.error("Failed to resolve:", error);
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: "Failed to resolve dispute",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, account, toast],
  );

  const recieveFunds = useCallback(
    async (eId: number, listingId: number) => {
      if (!isConnected || !account) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
        });
        return false;
      }

      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const escrowManagerContract = new Contract(
          escrowManagerAddress,
          escrowManagerABI,
          signer,
        );

        const tx = await escrowManagerContract.autoRelease(eId);
        const receipt = await tx.wait();

        if (receipt && receipt.status === 1) {
          // 3. Find and parse the specific event (e.g., 'EscrowCreated')
          const parsedLog = receipt.logs
            .map((log: any) => {
              try {
                // Returns a LogDescription object with name and args
                return escrowManagerContract.interface.parseLog(log);
              } catch (e) {
                return null; // Log was not from this contract
              }
            })
            .find((event: any) => event?.name === "AutoReleased");
          console.log("Parsed Log: ", parsedLog);

          if (parsedLog) {
            //5. Update Supabase
            const { error } = await supabase
              .from("escrows")
              .update({ status: "completed" })
              .eq("id", eId);

            if (error) {
              console.error("Error updating listing status:", error);
              throw error;
            }

            const { error: updateError } = await supabase
              .from("listings")
              .update({ status: "rented" })
              .eq("id", listingId);

            if (updateError) {
              console.error("Error updating listing status:", updateError);
              throw updateError;
            }
          } else {
            throw new Error(
              "Failed to parse Released event from transaction logs",
            );
          }
        }

        toast({
          variant: "success",
          title: "Dispute Resolved",
          description: `Funds have been auto-released to your wallet`,
        });

        return true;
      } catch (error: any) {
        console.error("Failed to resolve:", error);
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: "Failed to resolve dispute",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, account, toast],
  );

  const getAllUserEscrows = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("escrows")
        .select(`*`)
        .or(
          `buyer_address.eq.${account},seller_address.eq.${account},arbiter_address.eq.${account}`,
        );
      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error("Failed to fetch escrow details:", error);
      return null;
    }
  }, [account]);

  return {
    isLoading,
    escrowManagerAddress,
    mneeAddress,
    createEscrow,
    confirmReceipt,
    raiseDispute,
    resolveDispute,
    getAllUserEscrows,
    recieveFunds,
  };
}
