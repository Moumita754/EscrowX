import { describe, it, expect } from "vitest";
import { parseError } from "./errors";

describe("parseError", () => {
  it("detects wallet rejection", () => {
    expect(parseError("User declined access")).toMatch(/rejected/i);
  });

  it("maps known contract error codes", () => {
    expect(parseError("HostError: Error(Contract, #4)")).toMatch(
      /greater than zero/i,
    );
    expect(parseError("Error(Contract, #6)")).toMatch(/escrow status/i);
  });

  it("detects real connectivity failures", () => {
    expect(parseError("TypeError: Failed to fetch")).toMatch(/network error/i);
  });

  it("classifies a wallet network-passphrase mismatch as wrong network", () => {
    const msg = parseError(
      "The transaction's network passphrase does not match the connected wallet.",
    );
    expect(msg).toMatch(/different network|testnet/i);
    expect(msg).not.toMatch(/check your connection/i);
  });

  it("does not mislabel contract errors as network errors", () => {
    expect(parseError("HostError: Error(Contract, #3)")).toMatch(
      /escrow not found/i,
    );
  });

  it("falls back gracefully for unknown errors", () => {
    expect(parseError(undefined)).toMatch(/went wrong/i);
  });
});
