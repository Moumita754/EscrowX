import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Store, FileText } from "lucide-react";
import { useEscrow } from "@/hooks/useEscrows";
import { useWallet } from "@/hooks/useWallet";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CopyButton } from "@/components/ui/CopyButton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Timeline } from "@/components/escrow/Timeline";
import { EscrowActions } from "@/components/escrow/EscrowActions";
import { formatAmount, formatDate, shortenAddress } from "@/utils/format";
import { accountExplorerUrl } from "@/utils/stellar";
import { parseError } from "@/utils/errors";

const PartyRow = ({
  icon: Icon,
  label,
  address,
  isYou,
}: {
  icon: typeof User;
  label: string;
  address: string;
  isYou: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 py-3">
    <span className="flex items-center gap-2 text-sm text-slate-400">
      <Icon className="h-4 w-4" />
      {label}
      {isYou && (
        <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-xs text-brand-300">
          You
        </span>
      )}
    </span>
    <span className="flex items-center gap-2">
      <a
        href={accountExplorerUrl(address)}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-sm text-slate-200 hover:text-brand-300"
      >
        {shortenAddress(address, 6)}
      </a>
      <CopyButton value={address} />
    </span>
  </div>
);

export const EscrowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useWallet();
  const escrowId = Number(id);
  const { data: escrow, isLoading, isError, error, refetch } = useEscrow(escrowId);

  if (Number.isNaN(escrowId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState message="Invalid escrow id." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : isError || !escrow ? (
        <ErrorState
          message={
            error
              ? parseError(error)
              : `Escrow #${escrowId} was not found on the configured contract.`
          }
          onRetry={() => refetch()}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm text-slate-500">
                  Escrow #{escrow.id}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-white">
                  {formatAmount(escrow.amount)}{" "}
                  <span className="text-lg text-slate-400">XLM</span>
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Created {formatDate(escrow.createdAt)}
                </p>
              </div>
              <StatusBadge status={escrow.status} />
            </div>

            <div className="mt-4 divide-y divide-white/5 border-t border-white/5">
              <PartyRow
                icon={User}
                label="Buyer"
                address={escrow.buyer}
                isYou={address === escrow.buyer}
              />
              <PartyRow
                icon={Store}
                label="Seller"
                address={escrow.seller}
                isYou={address === escrow.seller}
              />
              <div className="flex items-start justify-between gap-3 py-3">
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  <FileText className="h-4 w-4" />
                  Description
                </span>
                <span className="max-w-xs text-right text-sm text-slate-200">
                  {escrow.description}
                </span>
              </div>
            </div>
          </div>

          <EscrowActions escrow={escrow} />
          <Timeline status={escrow.status} />

          <p className="text-center text-xs text-slate-600">
            Need to start another?{" "}
            <Link to="/create" className="text-brand-300 hover:underline">
              Create a new escrow
            </Link>
          </p>
        </motion.div>
      )}
    </div>
  );
};
