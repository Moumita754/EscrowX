import { EscrowStatus } from "@/types/escrow";

const STYLES: Record<EscrowStatus, string> = {
  [EscrowStatus.Pending]: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  [EscrowStatus.Funded]: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  [EscrowStatus.Delivered]:
    "bg-violet-500/15 text-violet-300 border-violet-500/30",
  [EscrowStatus.Completed]:
    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  [EscrowStatus.Refunded]: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export const StatusBadge = ({ status }: { status: EscrowStatus }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${STYLES[status]}`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);
