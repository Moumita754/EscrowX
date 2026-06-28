import { useQuery } from "@tanstack/react-query";
import { contractService } from "@/services/contract";
import type { Escrow } from "@/types/escrow";
import { useWallet } from "./useWallet";

export const escrowKeys = {
  all: ["escrows"] as const,
  list: (address: string) => [...escrowKeys.all, "list", address] as const,
  detail: (id: number) => [...escrowKeys.all, "detail", id] as const,
};

export const useEscrows = () => {
  const { address } = useWallet();

  return useQuery<Escrow[]>({
    queryKey: escrowKeys.list(address ?? "none"),
    enabled: Boolean(address),
    refetchInterval: 15_000,
    queryFn: async () => {
      const all = await contractService.listEscrows();
      return all
        .filter((e) => e.buyer === address || e.seller === address)
        .sort((a, b) => b.createdAt - a.createdAt);
    },
  });
};

export const useEscrow = (id: number) =>
  useQuery<Escrow>({
    queryKey: escrowKeys.detail(id),
    enabled: Number.isInteger(id) && id >= 0,
    refetchInterval: 10_000,
    queryFn: () => contractService.getEscrow(id),
  });
