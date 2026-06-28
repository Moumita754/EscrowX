import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { contractService } from "@/services/contract";
import { addActivity } from "@/services/storage";
import { isContractConfigured } from "@/config";
import { EscrowStage } from "@/types/flow";
import { EscrowFlowError, parseError } from "@/utils/errors";
import { toStroops } from "@/utils/format";
import { logger } from "@/utils/logger";
import { useWallet } from "./useWallet";
import { escrowKeys } from "./useEscrows";

interface CreateInput {
  seller: string;
  amount: string; // human XLM
  description: string;
}

interface CreateResult {
  id: number;
  hash: string;
}

export const useCreateEscrow = () => {
  const { address, signTransaction, isConnected, isWrongNetwork } = useWallet();
  const queryClient = useQueryClient();

  const [stage, setStage] = useState<EscrowStage | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<CreateResult | null>(null);

  const create = async (input: CreateInput): Promise<CreateResult> => {
    setStage(EscrowStage.Validate);
    setResult(null);

    // Phase 4 — pre-flight validation before touching the wallet.
    if (!isContractConfigured()) {
      throw new EscrowFlowError(
        EscrowStage.Validate,
        "Contract is not configured. Set VITE_CONTRACT_ID.",
      );
    }
    if (!isConnected || !address) {
      throw new EscrowFlowError(EscrowStage.Wallet, "Connect a wallet first.");
    }
    if (isWrongNetwork) {
      throw new EscrowFlowError(
        EscrowStage.Wallet,
        "Your wallet is on the wrong network. Switch it and try again.",
      );
    }

    setIsPending(true);
    logger.start("create", "Creating escrow", { ...input, source: address });
    try {
      const tx = await contractService.createEscrow(
        signTransaction,
        address,
        {
          seller: input.seller.trim(),
          amount: toStroops(input.amount),
          description: input.description.trim(),
        },
        setStage,
      );
      const id = Number(tx.returnValue);
      addActivity(address, {
        id: `${id}-EscrowCreated-${Date.now()}`,
        escrowId: id,
        type: "EscrowCreated",
        message: "Escrow created",
        timestamp: Math.floor(Date.now() / 1000),
        txHash: tx.hash,
      });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
      const created = { id, hash: tx.hash };
      setResult(created);
      toast.success("Escrow created");
      return created;
    } catch (error) {
      const message =
        error instanceof EscrowFlowError ? error.friendly : parseError(error);
      logger.error("create", message, error);
      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const reset = () => {
    setStage(null);
    setResult(null);
  };

  return { create, stage, isPending, result, reset };
};
