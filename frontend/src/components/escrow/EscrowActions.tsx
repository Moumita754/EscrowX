import {
  ArrowDownToLine,
  PackageCheck,
  Send,
  Undo2,
  CheckCircle2,
} from "lucide-react";
import { EscrowStatus, type Escrow } from "@/types/escrow";
import { useWallet } from "@/hooks/useWallet";
import { useEscrowActions } from "@/hooks/useEscrowActions";

export const EscrowActions = ({ escrow }: { escrow: Escrow }) => {
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

  if (
    escrow.status === EscrowStatus.Completed ||
    escrow.status === EscrowStatus.Refunded
  ) {
    return (
      <div className="card flex items-center gap-3 p-5 text-sm text-slate-300">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        This escrow is finalized. No further actions are available.
      </div>
    );
  }

  const noActions = !canDeposit && !canMarkDelivered && !canSettle;

  return (
    <div className="card p-5">
      <p className="mb-4 text-sm font-medium text-slate-300">Actions</p>
      <div className="flex flex-wrap gap-3">
        {canDeposit && (
          <button
            type="button"
            disabled={busy}
            onClick={() => deposit.mutate(escrow.id)}
            className="btn-primary"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Deposit Funds
          </button>
        )}
        {canMarkDelivered && (
          <button
            type="button"
            disabled={busy}
            onClick={() => markDelivered.mutate(escrow.id)}
            className="btn-primary"
          >
            <PackageCheck className="h-4 w-4" />
            Mark Delivered
          </button>
        )}
        {canSettle && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => release.mutate(escrow.id)}
              className="btn-primary"
            >
              <Send className="h-4 w-4" />
              Release Funds
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => refund.mutate(escrow.id)}
              className="btn-danger"
            >
              <Undo2 className="h-4 w-4" />
              Refund
            </button>
          </>
        )}
      </div>

      {noActions && (
        <p className="text-sm text-slate-500">
          Waiting on the counterparty — no actions available for you right now.
        </p>
      )}
    </div>
  );
};
