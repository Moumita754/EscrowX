import { Link } from "react-router-dom";
import {
  Plus,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Lock,
  Inbox,
  Wallet,
  Undo2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { useEscrows } from "@/hooks/useEscrows";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useWallet } from "@/hooks/useWallet";
import { EscrowStatus, type Escrow } from "@/types/escrow";
import { StatCard } from "@/components/ui/StatCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EscrowCard } from "@/components/escrow/EscrowCard";
import { formatAmount } from "@/utils/format";
import { parseError } from "@/utils/errors";

const ACTIVE = [
  EscrowStatus.Pending,
  EscrowStatus.Funded,
  EscrowStatus.Delivered,
];

const Section = ({
  title,
  icon: Icon,
  escrows,
}: {
  title: string;
  icon: typeof Inbox;
  escrows: Escrow[];
}) => (
  <div>
    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-500">
      <Icon className="h-4 w-4" />
      {title}
      <span className="text-slate-600">({escrows.length})</span>
    </h2>
    {escrows.length === 0 ? (
      <div className="card px-5 py-8 text-sm text-slate-500">
        Nothing here yet.
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        {escrows.map((escrow) => (
          <EscrowCard key={escrow.id} escrow={escrow} />
        ))}
      </div>
    )}
  </div>
);

export const Dashboard = () => {
  const { address } = useWallet();
  const { data: escrows, isLoading, isError, error, refetch } = useEscrows();
  const { data: balance } = useAccountBalance();

  const list = escrows ?? [];
  const outgoing = list.filter((e) => e.buyer === address);
  const incoming = list.filter((e) => e.seller === address);

  const completed = list.filter((e) => e.status === EscrowStatus.Completed).length;
  const refunded = list.filter((e) => e.status === EscrowStatus.Refunded).length;
  const active = list.filter((e) => ACTIVE.includes(e.status)).length;
  const lockedStroops = list
    .filter(
      (e) =>
        e.buyer === address &&
        (e.status === EscrowStatus.Funded ||
          e.status === EscrowStatus.Delivered),
    )
    .reduce((sum, e) => sum + BigInt(e.amount), 0n);

  const balanceLabel =
    balance === null || balance === undefined
      ? "—"
      : `${Number(balance).toLocaleString("en-US", { maximumFractionDigits: 2 })} XLM`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Manage your secure escrow payments.
          </p>
        </div>
        <Link to="/create" className="btn-primary">
          <Plus className="h-4 w-4" />
          New Escrow
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={Wallet} label="Wallet Balance" value={balanceLabel} />
            <StatCard
              icon={Lock}
              label="Locked Funds"
              value={`${formatAmount(lockedStroops.toString())} XLM`}
              accent="accent"
            />
            <StatCard
              icon={LayoutGrid}
              label="Total Escrows"
              value={String(list.length)}
            />
            <StatCard
              icon={Clock}
              label="Active"
              value={String(active)}
              accent="amber"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={String(completed)}
              accent="emerald"
            />
            <StatCard icon={Undo2} label="Refunded" value={String(refunded)} />
          </>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={parseError(error)} onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No escrows yet"
          description="Create your first escrow, or wait for someone to send one to your address."
          action={
            <Link to="/create" className="btn-primary">
              <Plus className="h-4 w-4" />
              Create Escrow
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">
          <Section
            title="Incoming — you are the receiver"
            icon={ArrowDownLeft}
            escrows={incoming}
          />
          <Section
            title="Outgoing — you are the sender"
            icon={ArrowUpRight}
            escrows={outgoing}
          />
        </div>
      )}
    </div>
  );
};
