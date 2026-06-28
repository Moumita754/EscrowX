import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  accent = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: "brand" | "emerald" | "amber" | "accent";
}) => {
  const accents: Record<string, string> = {
    brand: "text-brand-300 bg-brand-500/10",
    emerald: "text-emerald-300 bg-emerald-500/10",
    amber: "text-amber-300 bg-amber-500/10",
    accent: "text-accent-400 bg-accent-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`rounded-xl p-2 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
};
