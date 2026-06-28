export enum EscrowStatus {
  Pending = "Pending",
  Funded = "Funded",
  Delivered = "Delivered",
  Completed = "Completed",
  Refunded = "Refunded",
}

export const STATUS_BY_INDEX: EscrowStatus[] = [
  EscrowStatus.Pending,
  EscrowStatus.Funded,
  EscrowStatus.Delivered,
  EscrowStatus.Completed,
  EscrowStatus.Refunded,
];

export interface Escrow {
  id: number;
  buyer: string;
  seller: string;
  token: string;
  amount: string;
  description: string;
  status: EscrowStatus;
  createdAt: number;
}

export type EscrowAction =
  | "deposit"
  | "mark_delivered"
  | "release"
  | "refund";

export interface ActivityItem {
  id: string;
  escrowId: number;
  type: string;
  message: string;
  timestamp: number;
  txHash?: string;
}
