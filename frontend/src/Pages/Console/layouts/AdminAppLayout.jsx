import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaBriefcase, FaBuilding, FaChartPie, FaUsers } from "react-icons/fa";

import { useAuth } from "../../../context/useAuth";
import ThemeToggle from "../../../Components/UI/ThemeToggle";

const navItems = [
  { to: "/console/app", label: "Vue d'ensemble", icon: FaChartPie, end: true },
  { to: "/console/app/utilisateurs", label: "Utilisateurs", icon: FaUsers },
  { to: "/console/app/entreprises", label: "Entreprises", icon: FaBuilding },
  { to: "/console/app/offres", label: "Offres", icon: FaBriefcase },
];

export default function AdminAppLayout() {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.username || "Administrateur";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-5 text-white lg:block">
        <div className="flex items-center gap-3 px-2">
          <img src="/logo.png" alt="PRCS" className="h-10 rounded-xl bg-white p-1" />
          <div>
            <p className="font-semibold">PRCS Console</p>
            <p className="text-xs text-slate-400">Administration plateforme</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur-xl lg:px-8 dark:border-slate-800 dark:bg-slate-950/85">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Console</p>
              <p className="font-semibold text-slate-950 dark:text-white">Administration du site</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-semibold text-white dark:bg-blue-600">
                  {initial}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold dark:text-white">{displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Administrateur</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <MobileLink key={item.to} {...item} />
            ))}
          </nav>
        </header>

        <main className="px-5 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl border-l-2 px-4 py-2.5 text-sm font-semibold transition ${
          isActive
            ? "border-blue-500 bg-white/[0.06] text-white"
            : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"
        }`
      }
    >
      <Icon /> {label}
    </NavLink>
  );
}

function MobileLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
          isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`
      }
    >
      <Icon /> {label}
    </NavLink>
  );
}
