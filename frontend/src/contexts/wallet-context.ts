import { createContext } from "react";
import type { WalletKind } from "@/services/wallets";

export interface WalletContextValue {
  kind: WalletKind | null;
  address: string | null;
  network: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  isWrongNetwork: boolean;
  connect: (kind: WalletKind) => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

export const WalletContext = createContext<WalletContextValue | undefined>(
  undefined,
);
