import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Zap,
  Wallet,
  PackageCheck,
  Send,
  ArrowRight,
  ChevronDown,
  Coins,
  Globe2,
  Eye,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { WalletModal } from "@/components/layout/WalletModal";

const features = [
  {
    icon: Lock,
    title: "Funds Locked On-Chain",
    description:
      "Deposits live inside a Soroban smart contract — not a company wallet. No middleman can touch them.",
  },
  {
    icon: ShieldCheck,
    title: "Trustless Settlement",
    description:
      "Payment only releases when the buyer confirms. Refunds stay available until then. Rules enforced by code.",
  },
  {
    icon: Zap,
    title: "Fast & Low Cost",
    description:
      "Stellar settles in seconds for a fraction of a cent, so escrow works even for small payments.",
  },
];

const steps = [
  {
    icon: Wallet,
    title: "Create & Deposit",
    description: "Buyer creates an escrow and locks funds into the contract.",
  },
  {
    icon: PackageCheck,
    title: "Deliver",
    description: "Seller fulfills the order and marks it as delivered.",
  },
  {
    icon: Send,
    title: "Release",
    description: "Buyer releases the payment — funds land with the seller.",
  },
];

const whyStellar = [
  {
    icon: Coins,
    title: "Near-zero fees",
    description: "Transactions cost a fraction of a cent.",
  },
  {
    icon: Zap,
    title: "3–5s finality",
    description: "Payments confirm almost instantly.",
  },
  {
    icon: Globe2,
    title: "Global reach",
    description: "Borderless settlement, 24/7.",
  },
  {
    icon: Eye,
    title: "Transparent",
    description: "Every action is verifiable on-chain.",
  },
];

const faqs = [
  {
    q: "What is an escrow?",
    a: "An escrow holds funds with a neutral third party until both sides meet their obligations. EscrowX replaces that third party with a Soroban smart contract.",
  },
  {
    q: "Do I need a wallet?",
    a: "Yes. EscrowX uses the Freighter browser wallet to sign transactions on the Stellar network. It's free to install.",
  },
  {
    q: "Can I get my money back?",
    a: "The buyer can refund the locked funds at any time before they release the payment. Once released, the transfer is final.",
  },
  {
    q: "Who controls the funds?",
    a: "Nobody. Funds are held by the smart contract and can only move according to its rules — release to the seller or refund to the buyer.",
  },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-white">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{a}</p>
      </motion.div>
    </div>
  );
};

export const Landing = () => {
  const { isConnected } = useWallet();
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <div>
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-brand-300">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                Powered by Stellar Soroban
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Secure Payments
                <br />
                <span className="gradient-text">Without Trust.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-slate-400">
                EscrowX locks funds in a smart contract until delivery is
                confirmed. No middlemen. No chargebacks. Just code you can
                verify.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {isConnected ? (
                  <Link to="/create" className="btn-primary">
                    Create Escrow
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setWalletOpen(true)}
                    className="btn-primary"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </button>
                )}
                <a href="#how" className="btn-secondary">
                  How it works
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-full bg-brand-500/20 blur-3xl" />
              <div className="card relative animate-float p-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Escrow #1024</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Funded
                  </span>
                </div>
                <p className="mt-6 text-sm text-slate-400">Amount locked</p>
                <p className="text-4xl font-bold text-white">
                  1,250 <span className="text-xl text-slate-400">XLM</span>
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    { icon: Wallet, label: "Buyer deposited", done: true },
                    { icon: PackageCheck, label: "Seller delivered", done: true },
                    { icon: Send, label: "Release payment", done: false },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          row.done
                            ? "bg-brand-500/20 text-brand-300"
                            : "bg-white/[0.04] text-slate-500"
                        }`}
                      >
                        <row.icon className="h-4 w-4" />
                      </span>
                      <span
                        className={`text-sm ${row.done ? "text-slate-200" : "text-slate-500"}`}
                      >
                        {row.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="card p-6"
            >
              <span className="inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-300">
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">How escrow works</h2>
          <p className="mt-3 text-slate-400">
            Three simple steps, fully enforced by the smart contract.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card relative p-6"
            >
              <span className="absolute right-5 top-5 text-5xl font-black text-white/5">
                {index + 1}
              </span>
              <span className="inline-flex rounded-xl bg-accent-500/10 p-3 text-accent-400">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Stellar */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="card overflow-hidden p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">Why Stellar?</h2>
              <p className="mt-3 text-slate-400">
                Escrow only makes sense when settlement is cheap, fast and
                global. Stellar delivers all three, making trustless payments
                practical for everyone.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {whyStellar.map((item) => (
                <div key={item.title} className="glass rounded-2xl p-5">
                  <item.icon className="h-6 w-6 text-brand-300" />
                  <p className="mt-3 font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="card relative overflow-hidden p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-grid-fade" />
          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
            Ready to pay <span className="gradient-text">without trust?</span>
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-slate-400">
            Connect your wallet and create your first secure escrow in under a
            minute.
          </p>
          <div className="relative mt-8 flex justify-center">
            {isConnected ? (
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setWalletOpen(true)}
                className="btn-primary"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
