import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function RecruiterPublicNav() {
  return (
    <header className="w-full bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-gray-100 dark:bg-slate-950/95 dark:border-slate-800 font-poppins">
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-6 py-3">
        <Link to="/recruteur" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="Logo" className="h-10 lg:h-11 w-auto object-contain" />
          <span className="hidden sm:inline font-bold text-lg text-blue-800 dark:text-blue-300">
            Espace employeurs
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium">
          <PublicLink to="/recruteur/solutions">Solutions</PublicLink>
          <PublicLink to="/recruteur/tarifs">Tarifs</PublicLink>
          <PublicLink to="/recruteur/temoignages">Notre approche</PublicLink>
          <PublicLink to="/recruteur/contact-demo">Contact</PublicLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/recruteur/connexion"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors dark:text-slate-300 dark:hover:text-blue-300"
          >
            Se connecter
          </Link>
          <Link
            to="/recruteur/inscription"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-md hover:shadow-blue-200 transition-all duration-200"
          >
            Créer un compte entreprise
          </Link>
        </div>
      </div>
    </header>
  );
}

function PublicLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? "text-blue-600 font-semibold dark:text-blue-400"
          : "text-gray-600 hover:text-blue-600 transition-colors duration-200 dark:text-slate-400 dark:hover:text-blue-400"
      }
    >
      {children}
    </NavLink>
  );
}
