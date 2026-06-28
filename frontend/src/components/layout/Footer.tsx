import { Github, Globe } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t border-white/5 bg-ink-950/60">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row lg:px-8">
      <div className="flex flex-col items-center gap-2 md:items-start">
        <Logo />
        <p className="text-sm text-slate-500">
          Secure escrow payments powered by Stellar.
        </p>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <a
          href="https://stellar.org"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-brand-300"
          aria-label="Stellar"
        >
          <Globe className="h-5 w-5" />
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-brand-300"
          aria-label="GitHub"
        >
          <Github className="h-5 w-5" />
        </a>
      </div>

      <p className="text-xs text-slate-600">
        © {new Date().getFullYear()} EscrowX · MIT License
      </p>
    </div>
  </footer>
);
