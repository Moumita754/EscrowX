import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

export const NotFound = () => (
  <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <span className="inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-300">
        <Compass className="h-10 w-10" />
      </span>
      <h1 className="mt-6 text-7xl font-black gradient-text">404</h1>
      <p className="mt-2 text-lg font-semibold text-white">Page not found</p>
      <p className="mt-1 text-sm text-slate-400">
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        <Home className="h-4 w-4" />
        Back home
      </Link>
    </motion.div>
  </div>
);
