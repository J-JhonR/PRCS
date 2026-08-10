import React from "react";
import { FaBullseye, FaHandshake, FaShieldAlt } from "react-icons/fa";
import RecruiterPublicNav from "../components/RecruiterPublicNav";

const VALUES = [
  {
    icon: FaBullseye,
    title: "La clarté avant tout",
    text: "Une offre bien décrite attire les bons profils. PRCS encourage des fiches de poste précises plutôt que des annonces génériques.",
  },
  {
    icon: FaHandshake,
    title: "Un vrai échange",
    text: "Chaque candidature reçoit un statut suivi et peut donner lieu à un échange direct avec le candidat, sans intermédiaire.",
  },
  {
    icon: FaShieldAlt,
    title: "Des données maîtrisées",
    text: "Les informations des candidats et des entreprises restent contrôlées par leurs propriétaires, avec des accès limités à ce qui est nécessaire.",
  },
];

export default function RecruiterTestimonialsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 font-poppins">
      <RecruiterPublicNav />
      <section className="bg-blue-50 dark:bg-slate-900 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">
            Notre approche
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-blue-900 dark:text-blue-200 md:text-5xl leading-tight">
            Un recrutement structuré, pas surchargé.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-slate-400">
            PRCS n'a pas vocation à empiler des fonctionnalités. La plateforme se
            concentre sur ce qui fait réellement avancer un recrutement : une offre
            claire, un suivi fiable des candidatures et une communication directe
            entre l'employeur et le candidat.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                <value.icon />
              </div>
              <h2 className="mt-4 font-bold text-blue-900 dark:text-blue-200">{value.title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-slate-400">{value.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-200">Pourquoi PRCS existe</h2>
          <p className="mt-4 leading-8 text-gray-600 dark:text-slate-400">
            Le projet est né d'un constat simple : trouver un emploi ou recruter en
            Haïti se fait encore souvent par bouche-à-oreille, des groupes de
            discussion ou des annonces éparpillées. PRCS propose un espace commun où
            les candidats peuvent explorer des offres réelles et où les employeurs
            peuvent gérer leur processus de recrutement de bout en bout, sans avoir à
            jongler entre plusieurs outils.
          </p>
        </div>
      </section>
    </main>
  );
}
