import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Logo } from "./Logo";
import { WalletButton } from "./WalletButton";
import { NotificationBell } from "./NotificationBell";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/create", label: "Create" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
];

export const Navbar = () => {
  const { isConnected } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {isConnected && (
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/[0.06] text-white"
                      : "text-slate-400 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {isConnected && <NotificationBell />}
          <WalletButton />
          {isConnected && (
            <button
              type="button"
              className="btn-secondary px-2.5 md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && isConnected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
