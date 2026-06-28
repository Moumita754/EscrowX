import { z } from "zod";
import { isValidStellarAddress } from "./stellar";

export const createEscrowSchema = z.object({
  seller: z
    .string()
    .trim()
    .min(1, "Seller address is required")
    .refine(isValidStellarAddress, "Enter a valid Stellar address (G…)"),
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((value) => /^\d+(\.\d{1,7})?$/.test(value), "Enter a valid amount")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero"),
  description: z
    .string()
    .trim()
    .min(3, "Add a short description")
    .max(200, "Keep the description under 200 characters"),
});

export type CreateEscrowValues = z.infer<typeof createEscrowSchema>;
