import { useState } from "react";
import { Check, Copy } from "lucide-react";

export const CopyButton = ({
  value,
  label,
}: {
  value: string;
  label?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label ?? "value"}`}
      className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-brand-300"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {label && <span className="text-xs">{label}</span>}
    </button>
  );
};
