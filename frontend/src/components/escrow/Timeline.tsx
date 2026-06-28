import { Check } from "lucide-react";
import { EscrowStatus } from "@/types/escrow";

const STEPS = [
  { status: EscrowStatus.Pending, label: "Created" },
  { status: EscrowStatus.Funded, label: "Funded" },
  { status: EscrowStatus.Delivered, label: "Delivered" },
  { status: EscrowStatus.Completed, label: "Completed" },
];

const ORDER: Record<EscrowStatus, number> = {
  [EscrowStatus.Pending]: 0,
  [EscrowStatus.Funded]: 1,
  [EscrowStatus.Delivered]: 2,
  [EscrowStatus.Completed]: 3,
  [EscrowStatus.Refunded]: 1,
};

export const Timeline = ({ status }: { status: EscrowStatus }) => {
  const current = ORDER[status];
  const isRefunded = status === EscrowStatus.Refunded;

  if (isRefunded) {
    return (
      <div className="card p-5">
        <p className="mb-4 text-sm font-medium text-slate-300">Timeline</p>
        <div className="flex items-center gap-3 text-rose-300">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/15">
            <Check className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium">
            Escrow was refunded to the buyer.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="mb-5 text-sm font-medium text-slate-300">Timeline</p>
      <ol className="space-y-5">
        {STEPS.map((step, index) => {
          const done = index <= current;
          const active = index === current;
          return (
            <li key={step.status} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors ${
                  done
                    ? "border-brand-400/40 bg-brand-500/20 text-brand-200"
                    : "border-white/10 bg-white/[0.02] text-slate-500"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={`text-sm ${
                  active
                    ? "font-semibold text-white"
                    : done
                      ? "text-slate-300"
                      : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
