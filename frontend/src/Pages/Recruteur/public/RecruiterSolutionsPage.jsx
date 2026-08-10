import React from "react";
import RecruiterPublicNav from "../components/RecruiterPublicNav";
import { ModuleCard } from "../components/RecruiterCards";
import { recruiterModules } from "../data/recruiterMockData";

export default function RecruiterSolutionsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 font-poppins">
      <RecruiterPublicNav />
      <section className="bg-blue-50 dark:bg-slate-900 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">Solutions</p>
          <h1 className="mt-4 mx-auto max-w-4xl text-4xl font-semibold text-blue-900 dark:text-blue-200 md:text-5xl leading-tight">
            Une suite RH lisible pour chaque étape du recrutement.
          </h1>
          <p className="mt-6 mx-auto max-w-2xl leading-8 text-gray-600 dark:text-slate-400">
            PRCS rassemble marque employeur, publication d'offres, pipeline, messagerie,
            entretiens et reporting dans une expérience cohérente. Chaque module répond
            à une étape précise du recrutement, sans complexité superflue.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {recruiterModules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-200">
              Un pipeline pensé pour rester lisible
            </h2>
            <p className="mt-4 leading-8 text-gray-600 dark:text-slate-400">
              Les candidatures reçues sur chaque offre sont classées par statut :
              reçue, en cours, acceptée ou déclinée. Le recruteur garde en permanence
              une vue claire de l'avancement, sans avoir à recouper plusieurs sources.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-200">
              Une messagerie liée à chaque candidature
            </h2>
            <p className="mt-4 leading-8 text-gray-600 dark:text-slate-400">
              Chaque échange avec un candidat reste rattaché à sa candidature. Plus
              besoin de retrouver un fil d'email perdu : l'historique complet est
              accessible directement depuis le profil du candidat.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
