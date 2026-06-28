import { FreighterWalletAdapter } from "./freighter";
import { AlbedoWalletAdapter } from "./albedo";
import type { WalletAdapter, WalletKind } from "./types";

export type { WalletAdapter, WalletAccount, WalletKind } from "./types";
export { WalletError } from "./types";

// Singleton adapters (Albedo keeps per-session state, so reuse instances).
const adapters: Record<WalletKind, WalletAdapter> = {
  freighter: new FreighterWalletAdapter(),
  albedo: new AlbedoWalletAdapter(),
};

export const getWalletAdapter = (kind: WalletKind): WalletAdapter =>
  adapters[kind];

export const WALLET_KINDS: WalletKind[] = ["freighter", "albedo"];

export const walletMeta = WALLET_KINDS.map((kind) => ({
  kind,
  name: adapters[kind].name,
  downloadUrl: adapters[kind].downloadUrl,
}));
