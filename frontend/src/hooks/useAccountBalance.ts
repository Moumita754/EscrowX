import { useQuery } from "@tanstack/react-query";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import { useWallet } from "./useWallet";

interface HorizonBalance {
  asset_type: string;
  balance: string;
}

/** Native XLM balance of the connected wallet, via Horizon. */
export const useAccountBalance = () => {
  const { address } = useWallet();

  return useQuery<string | null>({
    queryKey: ["balance", address ?? "none"],
    enabled: Boolean(address),
    refetchInterval: 20_000,
    queryFn: async () => {
      try {
        const res = await fetch(`${config.horizonUrl}/accounts/${address}`);
        if (res.status === 404) return "0"; // unfunded account
        if (!res.ok) throw new Error(`Horizon ${res.status}`);
        const data = (await res.json()) as { balances: HorizonBalance[] };
        const native = data.balances.find((b) => b.asset_type === "native");
        return native?.balance ?? "0";
      } catch (error) {
        logger.warn("balance", "Could not load wallet balance", error);
        return null;
      }
    },
  });
};
