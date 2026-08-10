import React from "react";
import RecruiterPublicNav from "../components/RecruiterPublicNav";
import { PricingCard } from "../components/RecruiterCards";
import { pricingPlans } from "../data/recruiterMockData";

export default function RecruiterPricingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 font-poppins">
      <RecruiterPublicNav />
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">Tarifs</p>
          <h1 className="mt-3 text-4xl font-semibold text-blue-900 dark:text-blue-200 md:text-5xl leading-tight">
            Des plans simples pour démarrer, grandir et structurer.
          </h1>
          <p className="mt-5 leading-8 text-slate-600 dark:text-slate-400">
            Un compte entreprise gratuit suffit pour publier une première offre et
            tester la plateforme. Les paliers suivants s'adressent aux équipes qui
            recrutent régulièrement et veulent structurer leur processus.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </section>
    </main>
  );
}
