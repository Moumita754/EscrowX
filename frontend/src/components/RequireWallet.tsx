import { useState } from "react";
import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { EmptyState } from "@/components/ui/EmptyState";
import { WalletModal } from "@/components/layout/WalletModal";

export const RequireWallet = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          icon={Wallet}
          title="Connect your wallet"
          description="Connect Freighter or Albedo to create and manage secure escrow payments."
          action={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-primary"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          }
        />
        <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return <>{children}</>;
};
