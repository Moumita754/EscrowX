import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
    <div className="rounded-2xl bg-brand-500/10 p-4 text-brand-300">
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="max-w-sm text-sm text-slate-400">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);
