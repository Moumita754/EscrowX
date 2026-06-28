export type WalletKind = "freighter" | "albedo";

export interface WalletAccount {
  address: string;
  /** Display name of the network, e.g. "TESTNET". */
  network: string;
  /** Network passphrase, used to detect a wrong-network wallet. */
  networkPassphrase: string;
}

export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletError";
  }
}

/**
 * Generic wallet contract the rest of the app codes against. Adding a new
 * wallet means implementing this interface and registering it — nothing else
 * in the app needs to change.
 *
 * Note: Soroban transaction *submission* is intentionally not part of this
 * interface. Both Freighter and Albedo only sign; submission is centralized in
 * the RPC layer (services/contract.ts) so it stays wallet-agnostic.
 */
export interface WalletAdapter {
  readonly kind: WalletKind;
  readonly name: string;
  readonly downloadUrl: string;

  /** Whether the wallet is usable in the current environment. */
  isAvailable(): Promise<boolean>;
  /** Interactive connect (may open the wallet UI). */
  connect(): Promise<WalletAccount>;
  /** Silent reconnect after a refresh; returns null if not possible. */
  restore(): Promise<WalletAccount | null>;
  /** Forget the local session. */
  disconnect(): void;
  /**
   * Sign a base64 transaction envelope XDR; returns the signed XDR.
   * `address` is the account that MUST sign (the tx source) — passing it makes
   * the wallet sign with the correct account instead of whatever is active,
   * preventing txBadAuth after the user switches accounts.
   */
  signTransaction(
    xdr: string,
    opts: { networkPassphrase: string; address: string },
  ): Promise<string>;
  /**
   * Optionally observe live account/network changes (e.g. the user switching
   * accounts in the extension). Returns an unsubscribe function. `null` in the
   * callback means the wallet was locked/disconnected.
   */
  watch?(callback: (account: WalletAccount | null) => void): () => void;
}
