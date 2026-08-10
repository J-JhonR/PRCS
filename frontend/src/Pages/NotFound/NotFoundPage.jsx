import React from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16">
      <p className="text-7xl font-semibold text-blue-600">404</p>
      <h1 className="text-2xl font-bold text-slate-900 mt-4">Page introuvable</h1>
      <p className="text-slate-500 mt-2 max-w-md">
        La page que vous recherchez n'existe pas ou a ete deplacee.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition"
      >
        <FaHome /> Retour a l'accueil
      </Link>
    </div>
  );
}
