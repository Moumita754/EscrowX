import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { config } from "@/config";
import { parseError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import {
  getWalletAdapter,
  WalletError,
  type WalletAccount,
  type WalletKind,
} from "@/services/wallets";
import { WalletContext, type WalletContextValue } from "./wallet-context";

const KIND_KEY = "escrowx:wallet:kind";

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [kind, setKind] = useState<WalletKind | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-reconnect the previously selected wallet after a refresh.
  useEffect(() => {
    const savedKind = sessionStorage.getItem(KIND_KEY) as WalletKind | null;
    if (!savedKind) return;
    getWalletAdapter(savedKind)
      .restore()
      .then((restored) => {
        if (restored) {
          setKind(savedKind);
          setAccount(restored);
          logger.ok("wallet", `Restored ${savedKind} session`, restored);
        }
      })
      .catch(() => undefined);
  }, []);

  // Track live network changes so wrong-network detection stays accurate, and
  // detect a full lock/disconnect.
  //
  // IMPORTANT: a browser-extension wallet (Freighter) has a single active
  // account shared across EVERY tab. If we blindly followed its account
  // changes, opening a second tab and selecting a different account there would
  // silently swap this tab's wallet too — leaving both tabs on the same
  // account. To allow testing multiple wallets in parallel tabs, each tab is
  // PINNED to the account it connected with: we ignore switches to a different
  // address (those belong to another tab) and only reflect network changes for
  // the same address. To change a tab's account, disconnect and reconnect it.
  useEffect(() => {
    if (!kind) return;
    const adapter = getWalletAdapter(kind);
    if (!adapter.watch) return;
    return adapter.watch((next) => {
      if (!next) {
        setAccount(null);
        setKind(null);
        sessionStorage.removeItem(KIND_KEY);
        return;
      }
      setAccount((prev) => {
        if (!prev) return next;
        // Account switched (most likely for another tab) — keep this tab pinned.
        if (prev.address !== next.address) return prev;
        // Same account: only update if the network actually changed.
        if (prev.networkPassphrase === next.networkPassphrase) return prev;
        return next;
      });
    });
  }, [kind]);

  const connect = useCallback(async (selected: WalletKind) => {
    setIsConnecting(true);
    try {
      const adapter = getWalletAdapter(selected);
      const connected = await adapter.connect();
      setKind(selected);
      setAccount(connected);
      sessionStorage.setItem(KIND_KEY, selected);
      toast.success(`${adapter.name} connected`);
    } catch (error) {
      const message =
        error instanceof WalletError ? error.message : parseError(error);
      logger.error("wallet", `Connect failed (${selected})`, error);
      toast.error(message);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (kind) getWalletAdapter(kind).disconnect();
    setKind(null);
    setAccount(null);
    sessionStorage.removeItem(KIND_KEY);
    toast("Wallet disconnected", { icon: "👋" });
  }, [kind]);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!kind || !account) throw new WalletError("No wallet connected.");
      return getWalletAdapter(kind).signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
        address: account.address,
      });
    },
    [kind, account],
  );

  const value = useMemo<WalletContextValue>(
    () => ({
      kind,
      address: account?.address ?? null,
      network: account?.network ?? null,
      isConnecting,
      isConnected: Boolean(account),
      isWrongNetwork: Boolean(
        account && account.networkPassphrase !== config.networkPassphrase,
      ),
      connect,
      disconnect,
      signTransaction,
    }),
    [kind, account, isConnecting, connect, disconnect, signTransaction],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
