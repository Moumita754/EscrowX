import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ExternalLink } from "lucide-react";
import { walletMeta, type WalletKind } from "@/services/wallets";
import { useWallet } from "@/hooks/useWallet";

const GRADIENTS: Record<WalletKind, string> = {
  freighter: "from-orange-500 to-amber-400",
  albedo: "from-sky-500 to-indigo-500",
};

export const WalletModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { connect, isConnecting, kind } = useWallet();

  const handleConnect = async (selected: WalletKind) => {
    try {
      await connect(selected);
      onClose();
    } catch {
      /* error toast handled in context */
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="glass-strong relative z-10 my-auto max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl p-6 shadow-card"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Connect a wallet</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {walletMeta.map((wallet) => {
                const busy = isConnecting && kind === wallet.kind;
                return (
                  <button
                    key={wallet.kind}
                    type="button"
                    disabled={isConnecting}
                    onClick={() => handleConnect(wallet.kind)}
                    className="glass flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-white/[0.08] disabled:opacity-60"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENTS[wallet.kind]} text-lg font-black text-white`}
                    >
                      {wallet.name[0]}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-white">
                        {wallet.name}
                      </span>
                      <a
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-300"
                      >
                        Learn more <ExternalLink className="h-3 w-3" />
                      </a>
                    </span>
                    {busy && (
                      <Loader2 className="h-5 w-5 animate-spin text-brand-300" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Testing both sides? Use Freighter in one tab and Albedo in another
              — each tab keeps its own connection.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
