import albedo from "@albedo-link/intent";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import {
  WalletError,
  type WalletAccount,
  type WalletAdapter,
} from "./types";

const ADDRESS_KEY = "escrowx:albedo:address";

// Albedo identifies networks by name; Stellar keypairs are network-agnostic.
const albedoNetwork = (): string =>
  config.network === "mainnet" ? "public" : "testnet";

export class AlbedoWalletAdapter implements WalletAdapter {
  readonly kind = "albedo" as const;
  readonly name = "Albedo";
  readonly downloadUrl = "https://albedo.link/";

  private address: string | null = null;

  async isAvailable(): Promise<boolean> {
    // Albedo is a hosted web wallet (popup) — always usable in a browser.
    return typeof window !== "undefined";
  }

  private toAccount(address: string): WalletAccount {
    return {
      address,
      network: config.network.toUpperCase(),
      networkPassphrase: config.networkPassphrase,
    };
  }

  async connect(): Promise<WalletAccount> {
    const result = await albedo.publicKey({
      token: crypto.randomUUID(),
    });
    if (!result.pubkey) {
      throw new WalletError("Albedo did not return a public key.");
    }
    this.address = result.pubkey;
    sessionStorage.setItem(ADDRESS_KEY, result.pubkey);
    const account = this.toAccount(result.pubkey);
    logger.ok("wallet", "Albedo connected", account);
    return account;
  }

  async restore(): Promise<WalletAccount | null> {
    const saved = sessionStorage.getItem(ADDRESS_KEY);
    if (!saved) return null;
    this.address = saved;
    return this.toAccount(saved);
  }

  disconnect(): void {
    this.address = null;
    sessionStorage.removeItem(ADDRESS_KEY);
  }

  async signTransaction(
    xdr: string,
    opts: { networkPassphrase: string; address: string },
  ): Promise<string> {
    const pubkey = opts.address || this.address || undefined;
    if (!pubkey) throw new WalletError("Albedo is not connected.");
    const result = await albedo.tx({
      xdr,
      pubkey,
      network: albedoNetwork(),
      submit: false,
    });
    if (!result.signed_envelope_xdr) {
      throw new WalletError("Albedo did not return a signed transaction.");
    }
    return result.signed_envelope_xdr;
  }
}
