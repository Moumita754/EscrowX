import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export const Logo = ({ to = "/" }: { to?: string }) => (
  <Link to={to} className="flex items-center gap-2.5">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow">
      <ShieldCheck className="h-5 w-5 text-white" />
    </span>
    <span className="text-lg font-bold tracking-tight text-white">
      Escrow<span className="gradient-text">X</span>
    </span>
  </Link>
);
