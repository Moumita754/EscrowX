import { AlertTriangle } from "lucide-react";
import { isContractConfigured } from "@/config";

export const ConfigBanner = () => {
  if (isContractConfigured()) return null;

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 text-sm text-amber-200 sm:px-6 lg:px-8">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          Contract not configured. Set <code>VITE_CONTRACT_ID</code> in your
          environment to enable on-chain actions.
        </span>
      </div>
    </div>
  );
};
