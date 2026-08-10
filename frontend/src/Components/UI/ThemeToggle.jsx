import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";

import { useTheme } from "../../context/useTheme";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className={`inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${className}`}
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </button>
  );
}
