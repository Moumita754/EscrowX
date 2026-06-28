import { useQuery } from "@tanstack/react-query";
import { getActivity } from "@/services/storage";
import type { ActivityItem } from "@/types/escrow";
import { useWallet } from "./useWallet";

export const useActivity = () => {
  const { address } = useWallet();

  return useQuery<ActivityItem[]>({
    queryKey: ["activity", address ?? "none"],
    enabled: Boolean(address),
    refetchInterval: 10_000,
    queryFn: () => getActivity(address!),
  });
};
