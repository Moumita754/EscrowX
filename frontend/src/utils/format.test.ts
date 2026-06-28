import { describe, it, expect } from "vitest";
import {
  toStroops,
  fromStroops,
  formatAmount,
  shortenAddress,
} from "./format";

describe("amount conversion", () => {
  it("converts whole units to stroops", () => {
    expect(toStroops("1")).toBe("10000000");
    expect(toStroops("100")).toBe("1000000000");
  });

  it("converts fractional units to stroops", () => {
    expect(toStroops("1.5")).toBe("15000000");
    expect(toStroops("0.0000001")).toBe("1");
  });

  it("round-trips stroops back to human units", () => {
    expect(fromStroops("10000000")).toBe("1");
    expect(fromStroops("15000000")).toBe("1.5");
    expect(fromStroops("1")).toBe("0.0000001");
  });

  it("formats large amounts with grouping", () => {
    expect(formatAmount("12500000000")).toBe("1,250");
  });
});

describe("shortenAddress", () => {
  it("shortens long addresses", () => {
    const address = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOP";
    expect(shortenAddress(address)).toContain("…");
    expect(shortenAddress(address).length).toBeLessThan(address.length);
  });

  it("returns empty string for empty input", () => {
    expect(shortenAddress("")).toBe("");
  });
});
