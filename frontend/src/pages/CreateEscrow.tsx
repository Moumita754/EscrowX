import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import {
  createEscrowSchema,
  type CreateEscrowValues,
} from "@/utils/validation";
import { EscrowStage, PIPELINE_STAGES, STAGE_LABELS } from "@/types/flow";
import { useCreateEscrow } from "@/hooks/useCreateEscrow";
import { useWallet } from "@/hooks/useWallet";
import { CopyButton } from "@/components/ui/CopyButton";
import { txExplorerUrl } from "@/utils/stellar";

const ProgressSteps = ({ stage }: { stage: EscrowStage | null }) => {
  const activeIndex = stage ? PIPELINE_STAGES.indexOf(stage) : -1;
  return (
    <div className="card mt-5 space-y-2 p-4">
      {PIPELINE_STAGES.map((step, index) => {
        const done =
          stage === EscrowStage.Done || (activeIndex > -1 && index < activeIndex);
        const active = index === activeIndex && stage !== EscrowStage.Done;
        return (
          <div key={step} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                done
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                  : active
                    ? "border-brand-400/50 bg-brand-500/15 text-brand-200"
                    : "border-white/10 text-slate-500"
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={
                active
                  ? "font-medium text-white"
                  : done
                    ? "text-slate-300"
                    : "text-slate-500"
              }
            >
              {STAGE_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const CreateEscrow = () => {
  const navigate = useNavigate();
  const { isWrongNetwork } = useWallet();
  const { create, stage, isPending, result, reset } = useCreateEscrow();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEscrowValues>({
    resolver: zodResolver(createEscrowSchema),
    defaultValues: { seller: "", amount: "", description: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create(values);
    } catch {
      /* error surfaced via toast + progress reset below */
    }
  });

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-white">Escrow created</h1>
          <p className="mt-1 text-sm text-slate-400">
            Escrow #{result.id} is now live on Stellar.
          </p>

          <div className="mt-5 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-left">
            <span className="min-w-0">
              <span className="block text-xs text-slate-500">
                Transaction hash
              </span>
              <span className="block truncate font-mono text-sm text-slate-200">
                {result.hash}
              </span>
            </span>
            <CopyButton value={result.hash} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate(`/escrow/${result.id}`)}
              className="btn-primary"
            >
              Open Escrow
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href={txExplorerUrl(result.hash)}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              View on Explorer
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={reset}
              className="btn-secondary"
            >
              Create Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex rounded-xl bg-brand-500/10 p-2.5 text-brand-300">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-white">Create Escrow</h1>
            <p className="text-sm text-slate-400">
              Register the agreement. You deposit funds in the next step.
            </p>
          </div>
        </div>

        {isWrongNetwork && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Your wallet is on the wrong network. Switch it before creating an
            escrow.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="seller" className="label">
              Seller Address
            </label>
            <input
              id="seller"
              className="input font-mono"
              placeholder="G…"
              autoComplete="off"
              disabled={isPending}
              {...register("seller")}
            />
            {errors.seller && (
              <p className="mt-1.5 text-sm text-rose-400">
                {errors.seller.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="label">
              Amount (XLM)
            </label>
            <input
              id="amount"
              className="input"
              placeholder="100"
              inputMode="decimal"
              autoComplete="off"
              disabled={isPending}
              {...register("amount")}
            />
            {errors.amount && (
              <p className="mt-1.5 text-sm text-rose-400">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              className="input min-h-24 resize-y"
              placeholder="What is this payment for?"
              disabled={isPending}
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-rose-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || isWrongNetwork}
            className="btn-primary w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {stage ? STAGE_LABELS[stage] : "Working…"}
              </>
            ) : (
              "Create Escrow"
            )}
          </button>
        </form>

        {isPending && <ProgressSteps stage={stage} />}
      </motion.div>
    </div>
  );
};
