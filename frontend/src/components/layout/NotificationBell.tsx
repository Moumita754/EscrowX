import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { timeAgo } from "@/utils/format";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) markAllRead();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="btn-secondary relative px-2.5"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-4 w-4 text-brand-300" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-strong absolute right-0 z-20 mt-2 w-80 rounded-2xl p-2 shadow-card"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold text-white">
                  Notifications
                </span>
                <span className="text-xs text-slate-500">
                  {notifications.length}
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-slate-500">
                    You're all caught up.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={`/escrow/${n.escrowId}`}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-brand-400"}`}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white">
                          {n.title}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {n.body}
                        </span>
                        <span className="block text-[11px] text-slate-600">
                          {timeAgo(n.timestamp)}
                        </span>
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
