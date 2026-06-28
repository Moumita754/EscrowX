import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";
import { EscrowStatus } from "@/types/escrow";

describe("StatusBadge", () => {
  it("renders the status label", () => {
    render(<StatusBadge status={EscrowStatus.Funded} />);
    expect(screen.getByText("Funded")).toBeInTheDocument();
  });

  it("renders each status variant", () => {
    Object.values(EscrowStatus).forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
      unmount();
    });
  });
});
