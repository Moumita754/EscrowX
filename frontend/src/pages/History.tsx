import { Link } from "react-router-dom";
import { History as HistoryIcon, ExternalLink } from "lucide-react";
import { useEscrows } from "@/hooks/useEscrows";
import { useActivity } from "@/hooks/useActivity";
import { useWallet } from "@/hooks/useWallet";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatAmount, formatDate, shortenAddress } from "@/utils/format";
import { txExplorerUrl } from "@/utils/stellar";
import { parseError } from "@/utils/errors";

export const History = () => {
  const { address } = useWallet();
  const { data: escrows, isLoading, isError, error, refetch } = useEscrows();
  const { data: activity } = useActivity();

  // Latest known tx hash per escrow, from locally-signed actions.
  const hashByEscrow = new Map<number, string>();
  for (const item of activity ?? []) {
    if (item.txHash && !hashByEscrow.has(item.escrowId)) {
      hashByEscrow.set(item.escrowId, item.txHash);
    }
  }

  const rows = (escrows ?? [])
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <p className="text-sm text-slate-400">
          Every escrow you are part of, newest first.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : isError ? (
        <ErrorState message={parseError(error)} onRetry={() => refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No history yet"
          description="Your escrow transactions will appear here once you start using EscrowX."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-12 gap-3 border-b border-white/5 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid">
            <span className="col-span-1">ID</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-2">Role</span>
            <span className="col-span-2">Counterparty</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1 text-right">Tx</span>
          </div>

          <div className="divide-y divide-white/5">
            {rows.map((e) => {
              const isBuyer = e.buyer === address;
              const counterparty = isBuyer ? e.seller : e.buyer;
              const hash = hashByEscrow.get(e.id);
              return (
                <div
                  key={e.id}
                  className="grid grid-cols-2 items-center gap-3 px-5 py-4 md:grid-cols-12"
                >
                  <Link
                    to={`/escrow/${e.id}`}
                    className="col-span-1 font-mono text-sm text-brand-300 hover:underline"
                  >
                    #{e.id}
                  </Link>
                  <span className="col-span-2 hidden text-sm text-slate-400 md:block">
                    {formatDate(e.createdAt)}
                  </span>
                  <span className="col-span-2 text-sm text-slate-300">
                    {isBuyer ? "Sender" : "Receiver"}
                  </span>
                  <span className="col-span-2 hidden font-mono text-sm text-slate-400 md:block">
                    {shortenAddress(counterparty)}
                  </span>
                  <span className="col-span-1 text-sm font-semibold text-white md:col-span-2">
                    {formatAmount(e.amount)} XLM
                  </span>
                  <span className="col-span-2">
                    <StatusBadge status={e.status} />
                  </span>
                  <span className="col-span-1 flex justify-end">
                    {hash ? (
                      <a
                        href={txExplorerUrl(hash)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-brand-300"
                        aria-label="View transaction"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
