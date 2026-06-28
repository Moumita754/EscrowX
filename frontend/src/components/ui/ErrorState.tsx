import { AlertTriangle, RotateCw } from "lucide-react";

export const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
    <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-300">
      <AlertTriangle className="h-8 w-8" />
    </div>
    <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
    <p className="max-w-sm text-sm text-slate-400">{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-secondary mt-2">
        <RotateCw className="h-4 w-4" />
        Retry
      </button>
    )}
  </div>
);
