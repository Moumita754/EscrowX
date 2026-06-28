import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  PackageCheck,
  Send,
  Undo2,
  ArrowUpRight,
  User,
  Store,
} from "lucide-react";
import { EscrowStatus, type Escrow } from "@/types/escrow";
import { useWallet } from "@/hooks/useWallet";
import { useEscrowActions } from "@/hooks/useEscrowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatAmount, formatDate, shortenAddress } from "@/utils/format";

export const EscrowCard = ({ escrow }: { escrow: Escrow }) => {
  const { address } = useWallet();
  const { deposit, markDelivered, release, refund } = useEscrowActions();

  const isBuyer = address === escrow.buyer;
  const isSeller = address === escrow.seller;
  const busy =
    deposit.isPending ||
    markDelivered.isPending ||
    release.isPending ||
    refund.isPending;

  const canDeposit = isBuyer && escrow.status === EscrowStatus.Pending;
  const canMarkDelivered = isSeller && escrow.status === EscrowStatus.Funded;
  const canSettle =
    isBuyer &&
    (escrow.status === EscrowStatus.Funded ||
      escrow.status === EscrowStatus.Delivered);

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-slate-500">#{escrow.id}</p>
          <p className="mt-0.5 truncate text-sm font-medium text-white">
            {escrow.description}
          </p>
        </div>
        <StatusBadge status={escrow.status} />
      </div>

      <div>
        <p className="text-2xl font-bold text-white">
          {formatAmount(escrow.amount)}{" "}
          <span className="text-base text-slate-400">XLM</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Created {formatDate(escrow.createdAt)}
        </p>
      </div>

      <div className="space-y-1.5 border-t border-white/5 pt-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <User className="h-3.5 w-3.5" /> Sender
            {isBuyer && <span className="text-brand-300">(you)</span>}
          </span>
          <span className="font-mono text-slate-300">
            {shortenAddress(escrow.buyer)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Store className="h-3.5 w-3.5" /> Receiver
            {isSeller && <span className="text-brand-300">(you)</span>}
          </span>
          <span className="font-mono text-slate-300">
            {shortenAddress(escrow.seller)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
        {canDeposit && (
          <button
            type="button"
            disabled={busy}
            onClick={() => deposit.mutate(escrow.id)}
            className="btn-primary px-3 py-2 text-xs"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" /> Deposit
          </button>
        )}
        {canMarkDelivered && (
          <button
            type="button"
            disabled={busy}
            onClick={() => markDelivered.mutate(escrow.id)}
            className="btn-primary px-3 py-2 text-xs"
          >
            <PackageCheck className="h-3.5 w-3.5" /> Mark Delivered
          </button>
        )}
        {canSettle && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => release.mutate(escrow.id)}
              className="btn-primary px-3 py-2 text-xs"
            >
              <Send className="h-3.5 w-3.5" /> Release
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => refund.mutate(escrow.id)}
              className="btn-danger px-3 py-2 text-xs"
            >
              <Undo2 className="h-3.5 w-3.5" /> Refund
            </button>
          </>
        )}
        <Link
          to={`/escrow/${escrow.id}`}
          className="btn-secondary ml-auto px-3 py-2 text-xs"
        >
          Details <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};
