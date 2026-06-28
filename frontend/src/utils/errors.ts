import { EscrowStage, STAGE_LABELS } from "@/types/flow";

// Mirrors the Escrow contract's EscrowError enum (contracts/escrow/src/errors.rs).
const ESCROW_CONTRACT_ERRORS: Record<number, string> = {
  1: "The contract is not initialized yet.",
  2: "The contract is already initialized.",
  3: "Escrow not found.",
  4: "Amount must be greater than zero.",
  5: "Buyer and seller must be different addresses.",
  6: "This action is not allowed for the current escrow status.",
};

// Mirrors the PaymentVault contract's VaultError enum (contracts/payment_vault/src/errors.rs).
const VAULT_CONTRACT_ERRORS: Record<number, string> = {
  1: "Payment vault is not initialized.",
  2: "Payment vault is already initialized.",
  3: "Amount must be greater than zero.",
  4: "Insufficient locked balance for this escrow.",
  5: "Funds are already locked for this escrow.",
};

/** A pipeline error that remembers which stage failed plus diagnostic detail. */
export class EscrowFlowError extends Error {
  readonly stage: EscrowStage;
  readonly detail?: string;
  readonly cause?: unknown;

  constructor(stage: EscrowStage, message: string, cause?: unknown) {
    super(message);
    this.name = "EscrowFlowError";
    this.stage = stage;
    this.cause = cause;
    this.detail = cause ? rawMessage(cause) : undefined;
  }

  /** Human-readable, stage-prefixed message for toasts. */
  get friendly(): string {
    return `${STAGE_LABELS[this.stage]}: ${this.message}`;
  }
}

const rawMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

/** Map any thrown value to a concise, user-friendly message. */
export const parseError = (error: unknown): string => {
  if (error instanceof EscrowFlowError) return error.message;
  if (!error) return "Something went wrong. Please try again.";

  const raw = rawMessage(error);

  // The classic XDR version-skew failure (stale SDK vs current network protocol).
  if (/bad union switch/i.test(raw)) {
    return "Wallet/SDK could not decode the transaction (XDR version mismatch). Update your wallet extension and reload.";
  }
  if (/user (declined|rejected)|denied|cancell?ed|rejected by user/i.test(raw)) {
    return "Transaction was rejected in your wallet.";
  }
  // Wallet on the wrong network — Freighter reports a "network passphrase" mismatch.
  if (
    /passphrase|wrong network|network mismatch|different network|switch (your )?network/i.test(
      raw,
    )
  ) {
    return "Your wallet is on a different network. Switch it to the app's network (Testnet) and try again.";
  }
  if (/not connected|no public key|freighter is not installed|albedo is not/i.test(raw)) {
    return "Wallet is not connected. Please connect a wallet.";
  }

  // Contract errors checked before the generic connectivity rule so they are
  // never swallowed by a broad match.
  const contractMatch = raw.match(/Error\(Contract,\s*#(\d+)\)/);
  if (contractMatch) {
    const code = Number(contractMatch[1]);
    return (
      ESCROW_CONTRACT_ERRORS[code] ??
      VAULT_CONTRACT_ERRORS[code] ??
      `Contract error (#${code}).`
    );
  }

  if (/insufficient/i.test(raw)) {
    return "Insufficient balance to complete this transaction.";
  }
  if (/timeout|timed out/i.test(raw)) {
    return "The network timed out. Please retry.";
  }
  // Narrowed: only real connectivity failures, not any message containing "network".
  if (
    /failed to fetch|fetch failed|networkerror|err_network|load failed|connection (refused|reset|error)|econnrefused|enotfound|getaddrinfo/i.test(
      raw,
    )
  ) {
    return "Network error. Please check your connection and retry.";
  }

  return raw.length > 160 ? "Transaction failed. Please try again." : raw;
};
