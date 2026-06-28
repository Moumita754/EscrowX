import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { EscrowStatus, type Escrow } from "@/types/escrow";
import { useNotifications } from "./useNotifications";

const ME = "GAME000000000000000000000000000000000000000000000000000";
const OTHER = "GOTHER0000000000000000000000000000000000000000000000000";

let escrowData: Escrow[] = [];

vi.mock("./useWallet", () => ({
  useWallet: () => ({ address: ME }),
}));

vi.mock("./useEscrows", () => ({
  useEscrows: () => ({ data: escrowData }),
}));

const make = (over: Partial<Escrow>): Escrow => ({
  id: 0,
  buyer: OTHER,
  seller: ME,
  token: "C".padEnd(56, "A"),
  amount: "1000",
  description: "test",
  status: EscrowStatus.Pending,
  createdAt: 1_700_000_000,
  ...over,
});

describe("useNotifications", () => {
  beforeEach(() => {
    localStorage.clear();
    escrowData = [];
  });

  it("notifies the receiver of a newly created escrow", () => {
    escrowData = [make({ id: 1, status: EscrowStatus.Pending })];
    const { result } = renderHook(() => useNotifications());
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.notifications[0].title).toMatch(/new escrow/i);
  });

  it("notifies the buyer to release once delivered", () => {
    escrowData = [
      make({ id: 2, buyer: ME, seller: OTHER, status: EscrowStatus.Delivered }),
    ];
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications[0].body).toMatch(/release/i);
  });

  it("ignores escrows the wallet is not part of", () => {
    escrowData = [
      make({ id: 3, buyer: OTHER, seller: OTHER, status: EscrowStatus.Funded }),
    ];
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toHaveLength(0);
  });
});
