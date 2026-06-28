import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Wallet, ChevronDown, AlertTriangle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/utils/format";
import { accountExplorerUrl } from "@/utils/stellar";
import { CopyButton } from "@/components/ui/CopyButton";
import { WalletModal } from "./WalletModal";

const WALLET_NAMES: Record<string, string> = {
  freighter: "Freighter",
  albedo: "Albedo",
};

export const WalletButton = () => {
  const { kind, address, network, isWrongNetwork, disconnect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!address) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </button>
        <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        className="btn-secondary"
      >
        <span
          className={`h-2 w-2 rounded-full ${isWrongNetwork ? "bg-amber-400" : "bg-emerald-400"}`}
        />
        {shortenAddress(address)}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-strong absolute right-0 z-20 mt-2 w-72 rounded-2xl p-4 shadow-card"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Wallet
                </span>
                <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-semibold text-brand-300">
                  {kind ? WALLET_NAMES[kind] : "Unknown"}
                </span>
              </div>

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Network
              </p>
              <p
                className={`mb-3 text-sm font-medium ${isWrongNetwork ? "text-amber-300" : "text-brand-300"}`}
              >
                {network ?? "Unknown"}
                {isWrongNetwork && " (wrong network)"}
              </p>

              {isWrongNetwork && (
                <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Switch your wallet network to match the app, or transactions
                  will fail.
                </div>
              )}

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Address
              </p>
              <div className="mb-4 flex items-center justify-between gap-2">
                <a
                  href={accountExplorerUrl(address)}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-slate-200 hover:text-brand-300"
                >
                  {shortenAddress(address, 8)}
                </a>
                <CopyButton value={address} />
              </div>

              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setMenuOpen(false);
                }}
                className="btn-danger w-full"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
