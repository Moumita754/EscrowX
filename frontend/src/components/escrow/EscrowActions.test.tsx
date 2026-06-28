import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EscrowActions } from "./EscrowActions";
import { EscrowStatus, type Escrow } from "@/types/escrow";

const BUYER = "GBUYER000000000000000000000000000000000000000000000000";
const SELLER = "GSELLER00000000000000000000000000000000000000000000000";

const walletMock = vi.fn();
const depositMutate = vi.fn();
const markDeliveredMutate = vi.fn();
const releaseMutate = vi.fn();
const refundMutate = vi.fn();

vi.mock("@/hooks/useWallet", () => ({
  useWallet: () => walletMock(),
}));

vi.mock("@/hooks/useEscrowActions", () => ({
  useEscrowActions: () => ({
    deposit: { mutate: depositMutate, isPending: false },
    markDelivered: { mutate: markDeliveredMutate, isPending: false },
    release: { mutate: releaseMutate, isPending: false },
    refund: { mutate: refundMutate, isPending: false },
  }),
}));

const baseEscrow: Escrow = {
  id: 1,
  buyer: BUYER,
  seller: SELLER,
  token: "C".padEnd(56, "A"),
  amount: "1000000000",
  description: "Test escrow",
  status: EscrowStatus.Pending,
  createdAt: 1_700_000_000,
};

const renderAs = (address: string, status: EscrowStatus) => {
  walletMock.mockReturnValue({ address });
  return render(<EscrowActions escrow={{ ...baseEscrow, status }} />);
};

describe("EscrowActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lets the buyer deposit when pending", () => {
    renderAs(BUYER, EscrowStatus.Pending);
    const button = screen.getByRole("button", { name: /deposit funds/i });
    fireEvent.click(button);
    expect(depositMutate).toHaveBeenCalledWith(1);
  });

  it("lets the seller mark delivered when funded", () => {
    renderAs(SELLER, EscrowStatus.Funded);
    expect(
      screen.getByRole("button", { name: /mark delivered/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /release funds/i }),
    ).not.toBeInTheDocument();
  });

  it("lets the buyer release and refund when funded", () => {
    renderAs(BUYER, EscrowStatus.Funded);
    fireEvent.click(screen.getByRole("button", { name: /release funds/i }));
    fireEvent.click(screen.getByRole("button", { name: /refund/i }));
    expect(releaseMutate).toHaveBeenCalledWith(1);
    expect(refundMutate).toHaveBeenCalledWith(1);
  });

  it("hides seller actions from the buyer when funded", () => {
    renderAs(BUYER, EscrowStatus.Funded);
    expect(
      screen.queryByRole("button", { name: /mark delivered/i }),
    ).not.toBeInTheDocument();
  });

  it("shows no actions once completed", () => {
    renderAs(BUYER, EscrowStatus.Completed);
    expect(screen.getByText(/finalized/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
