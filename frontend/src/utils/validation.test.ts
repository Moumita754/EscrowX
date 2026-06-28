import { describe, it, expect } from "vitest";
import { createEscrowSchema } from "./validation";

const VALID_ADDRESS =
  "GDBAU2S5NZYHNTH6NK5EYOAKAN7WBA47PAHHNSRS2H6WAV3IDKJJY4AR";

describe("createEscrowSchema", () => {
  it("accepts valid input", () => {
    const result = createEscrowSchema.safeParse({
      seller: VALID_ADDRESS,
      amount: "100",
      description: "Laptop purchase",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid seller address", () => {
    const result = createEscrowSchema.safeParse({
      seller: "not-an-address",
      amount: "100",
      description: "Valid description",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a zero amount", () => {
    const result = createEscrowSchema.safeParse({
      seller: VALID_ADDRESS,
      amount: "0",
      description: "Valid description",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many decimal places", () => {
    const result = createEscrowSchema.safeParse({
      seller: VALID_ADDRESS,
      amount: "1.123456789",
      description: "Valid description",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short description", () => {
    const result = createEscrowSchema.safeParse({
      seller: VALID_ADDRESS,
      amount: "100",
      description: "x",
    });
    expect(result.success).toBe(false);
  });
});
