import { ExternalLink, LogOut } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { config, isContractConfigured } from "@/config";
import { CopyButton } from "@/components/ui/CopyButton";
import { shortenAddress } from "@/utils/format";
import { accountExplorerUrl, contractExplorerUrl } from "@/utils/stellar";

const Row = ({
  label,
  value,
  href,
  copyValue,
}: {
  label: string;
  value: string;
  href?: string;
  copyValue?: string;
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-white/5 py-4 last:border-0">
    <span className="text-sm text-slate-400">{label}</span>
    <span className="flex items-center gap-2">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-sm text-slate-200 hover:text-brand-300"
        >
          {value}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="font-mono text-sm text-slate-200">{value}</span>
      )}
      {copyValue && <CopyButton value={copyValue} />}
    </span>
  </div>
);

const WALLET_NAMES: Record<string, string> = {
  freighter: "Freighter",
  albedo: "Albedo",
};

export const Settings = () => {
  const { kind, address, network, isWrongNetwork, disconnect } = useWallet();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">
          Your wallet and network configuration.
        </p>
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Wallet
        </h2>
        <Row label="Provider" value={kind ? WALLET_NAMES[kind] : "Unknown"} />
        {address && (
          <Row
            label="Address"
            value={shortenAddress(address, 8)}
            href={accountExplorerUrl(address)}
            copyValue={address}
          />
        )}
        <Row
          label="Network"
          value={`${network ?? "Unknown"}${isWrongNetwork ? " — wrong network" : ""}`}
        />
        <div className="pt-4">
          <button type="button" onClick={disconnect} className="btn-danger">
            <LogOut className="h-4 w-4" />
            Disconnect Wallet
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Contracts
        </h2>
        <Row label="Network" value={config.network} />
        <Row
          label="Escrow Contract"
          value={
            isContractConfigured()
              ? shortenAddress(config.contractId, 6)
              : "Not configured"
          }
          href={
            isContractConfigured()
              ? contractExplorerUrl(config.contractId)
              : undefined
          }
          copyValue={isContractConfigured() ? config.contractId : undefined}
        />
        <Row
          label="PaymentVault Contract"
          value={
            config.vaultId
              ? shortenAddress(config.vaultId, 6)
              : "Not configured"
          }
          href={
            config.vaultId ? contractExplorerUrl(config.vaultId) : undefined
          }
          copyValue={config.vaultId || undefined}
        />
        <Row
          label="Payment Token"
          value={shortenAddress(config.tokenId, 6)}
          copyValue={config.tokenId}
        />
        <Row label="RPC URL" value={config.rpcUrl} />
      </div>

      <p className="mt-4 text-center text-xs text-slate-600">
        The app calls the Escrow contract only. The Escrow contract calls the
        PaymentVault via cross-contract invocation.
      </p>
    </div>
  );
};
