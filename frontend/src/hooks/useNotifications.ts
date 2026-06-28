import { useCallback, useEffect, useMemo, useState } from "react";
import { EscrowStatus, type Escrow } from "@/types/escrow";
import { useWallet } from "./useWallet";
import { useEscrows } from "./useEscrows";

export interface AppNotification {
  id: string;
  escrowId: number;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

const readKey = (address: string) => `escrowx:notif-read:${address}`;

/** A notification is derived from each escrow's current state for the connected
 *  wallet. Its id encodes the state, so each new transition becomes a fresh
 *  unread item that resolves automatically as the escrow progresses. */
const derive = (escrows: Escrow[], address: string): Omit<AppNotification, "read">[] => {
  const items: Omit<AppNotification, "read">[] = [];

  for (const e of escrows) {
    const isBuyer = e.buyer === address;
    const isSeller = e.seller === address;
    const base = { escrowId: e.id, timestamp: e.createdAt };

    if (isSeller && e.status === EscrowStatus.Pending) {
      items.push({ ...base, id: `${e.id}:received`, title: "New escrow received", body: `Escrow #${e.id} was created for you, awaiting the sender's deposit.` });
    }
    if (isSeller && e.status === EscrowStatus.Funded) {
      items.push({ ...base, id: `${e.id}:funded`, title: "Escrow funded", body: `Escrow #${e.id} is funded. Mark it delivered so the sender can release.` });
    }
    if (isBuyer && e.status === EscrowStatus.Delivered) {
      items.push({ ...base, id: `${e.id}:delivered`, title: "Delivery marked", body: `Seller marked escrow #${e.id} delivered — release the funds.` });
    }
    if (e.status === EscrowStatus.Completed) {
      items.push({ ...base, id: `${e.id}:completed`, title: isSeller ? "Funds released to you" : "Escrow completed", body: `Escrow #${e.id} is complete.` });
    }
    if (e.status === EscrowStatus.Refunded) {
      items.push({ ...base, id: `${e.id}:refunded`, title: "Refund completed", body: `Escrow #${e.id} was refunded to the sender.` });
    }
  }

  return items.sort((a, b) => b.timestamp - a.timestamp);
};

export const useNotifications = () => {
  const { address } = useWallet();
  const { data: escrows } = useEscrows();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!address) return;
    try {
      const raw = localStorage.getItem(readKey(address));
      setReadIds(new Set(raw ? (JSON.parse(raw) as string[]) : []));
    } catch {
      setReadIds(new Set());
    }
  }, [address]);

  const notifications = useMemo<AppNotification[]>(() => {
    if (!address || !escrows) return [];
    return derive(escrows, address).map((n) => ({
      ...n,
      read: readIds.has(n.id),
    }));
  }, [escrows, address, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    if (!address) return;
    const ids = notifications.map((n) => n.id);
    const next = new Set(ids);
    setReadIds(next);
    localStorage.setItem(readKey(address), JSON.stringify([...next]));
  }, [address, notifications]);

  return { notifications, unreadCount, markAllRead };
};
