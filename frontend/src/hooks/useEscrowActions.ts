import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { contractService, type SignFn, type TxResult } from "@/services/contract";
import { addActivity } from "@/services/storage";
import { parseError } from "@/utils/errors";
import type { ActivityItem } from "@/types/escrow";
import { useWallet } from "./useWallet";
import { escrowKeys } from "./useEscrows";

interface ActionMessages {
  loading: string;
  success: string;
  activity: string;
}

export const useEscrowActions = () => {
  const { address, signTransaction, isWrongNetwork } = useWallet();
  const queryClient = useQueryClient();

  const logActivity = (
    escrowId: number,
    type: string,
    message: string,
    txHash?: string,
  ) => {
    if (!address) return;
    const item: ActivityItem = {
      id: `${escrowId}-${type}-${Date.now()}`,
      escrowId,
      type,
      message,
      timestamp: Math.floor(Date.now() / 1000),
      txHash,
    };
    addActivity(address, item);
  };

  const invalidate = (escrowId?: number) => {
    queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    if (typeof escrowId === "number") {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(escrowId) });
    }
  };

  const runAction = async (
    escrowId: number,
    type: string,
    fn: (sign: SignFn, source: string, id: number) => Promise<TxResult>,
    messages: ActionMessages,
  ): Promise<TxResult> => {
    if (!address) throw new Error("Wallet not connected.");
    if (isWrongNetwork) {
      throw new Error(
        "Your wallet is on a different network. Switch it to Testnet and try again.",
      );
    }
    const result = await toast.promise(fn(signTransaction, address, escrowId), {
      loading: messages.loading,
      success: messages.success,
      error: (error) => parseError(error),
    });
    logActivity(escrowId, type, messages.activity, result.hash);
    return result;
  };

  const deposit = useMutation({
    mutationFn: (escrowId: number) =>
      runAction(escrowId, "FundsDeposited", contractService.deposit, {
        loading: "Depositing funds…",
        success: "Funds deposited",
        activity: "Funds deposited into escrow",
      }),
    onSuccess: (_data, escrowId) => invalidate(escrowId),
  });

  const markDelivered = useMutation({
    mutationFn: (escrowId: number) =>
      runAction(escrowId, "DeliveryMarked", contractService.markDelivered, {
        loading: "Marking as delivered…",
        success: "Marked as delivered",
        activity: "Seller marked the order delivered",
      }),
    onSuccess: (_data, escrowId) => invalidate(escrowId),
  });

  const release = useMutation({
    mutationFn: (escrowId: number) =>
      runAction(escrowId, "FundsReleased", contractService.release, {
        loading: "Releasing funds…",
        success: "Funds released to seller",
        activity: "Funds released to seller",
      }),
    onSuccess: (_data, escrowId) => invalidate(escrowId),
  });

  const refund = useMutation({
    mutationFn: (escrowId: number) =>
      runAction(escrowId, "FundsRefunded", contractService.refund, {
        loading: "Processing refund…",
        success: "Funds refunded",
        activity: "Funds refunded to buyer",
      }),
    onSuccess: (_data, escrowId) => invalidate(escrowId),
  });

  return { deposit, markDelivered, release, refund };
};
