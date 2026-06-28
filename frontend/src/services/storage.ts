import type { ActivityItem } from "@/types/escrow";

// Escrow records live on-chain (read via the Escrow contract's `list_escrows`).
// We keep a per-wallet activity feed locally for a snappy history view.

const activityKey = (address: string) => `escrowx:activity:${address}`;

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — non-fatal */
  }
};

export const getActivity = (address: string): ActivityItem[] =>
  read<ActivityItem[]>(activityKey(address), []);

export const addActivity = (address: string, item: ActivityItem) => {
  const items = [item, ...getActivity(address)].slice(0, 50);
  write(activityKey(address), items);
};
