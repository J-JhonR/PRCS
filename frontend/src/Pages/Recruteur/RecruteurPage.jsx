import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";

import RecruiterPublicNav from "./components/RecruiterPublicNav";
import { recruiterModules, recruiterStats } from "./data/recruiterMockData";

export default function RecruteurPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-poppins" id="main-content">
      <RecruiterPublicNav />

      {/* ---------- Hero : bloc de couleur plein, typographie editoriale ---------- */}
      <section className="bg-blue-800 dark:bg-blue-950">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Espace employeur</p>
            <h1 className="mt-6 text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight text-white">
              Recrutez.
              <br />
              Sans friction.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-blue-100">
              PRCS est une plateforme pensée pour simplifier le recrutement en Haïti :
              publier une offre, recevoir des candidatures qualifiées et échanger avec
              les talents, le tout depuis un seul espace, sans tableur ni fil d'emails
              dispersé.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/recruteur/inscription"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-blue-900 transition hover:bg-blue-50"
              >
                Créer un compte entreprise <FaArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/recruteur/solutions"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Découvrir la plateforme
              </Link>
            </div>
          </div>

          {/* Chiffres editoriaux, directement sur le bloc bleu */}
          <div className="mt-24 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/15 pt-12 md:grid-cols-4">
            {recruiterStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Avantages : grille asymetrique ---------- */}
      <section className="container mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold text-blue-900 dark:text-blue-200 max-w-lg leading-tight">
            Un espace RH complet.
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-sm leading-7">
            De la publication de l'offre jusqu'à l'entretien final, chaque étape du
            recrutement est suivie et centralisée au même endroit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Grande tuile avec photo */}
          <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden min-h-[320px] group">
            <img
              src="/images/explore.jpg"
              alt="Équipe RH au travail"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/20 to-transparent" />
            <div className="absolute bottom-0 p-8">
              <h3 className="text-2xl font-bold text-white">{recruiterModules[0]?.title}</h3>
              <p className="mt-2 max-w-sm text-blue-100 leading-7">{recruiterModules[0]?.description}</p>
            </div>
          </div>

          {/* Tuiles compactes */}
          {recruiterModules.slice(1, 5).map((module) => (
            <div
              key={module.title}
              className="rounded-3xl border border-gray-100 dark:border-slate-800 p-6 hover:border-blue-200 dark:hover:border-blue-800 transition"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                <module.icon />
              </div>
              <h3 className="mt-4 font-bold text-blue-900 dark:text-blue-200">{module.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">{module.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Comment ca marche : numeros geants ---------- */}
      <section className="bg-gray-50 dark:bg-slate-900 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-semibold text-blue-900 dark:text-blue-200 mb-4">
            Trois étapes.
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mb-16 leading-7">
            Aucune configuration complexe : votre espace employeur est opérationnel
            en quelques minutes, sans installation ni formation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                n: "01",
                title: "Créez votre profil",
                text: "Nom, secteur, localisation et description de votre organisation. Un formulaire unique, pensé pour être rempli en quelques minutes.",
              },
              {
                n: "02",
                title: "Publiez vos offres",
                text: "Rédigez votre offre, enregistrez-la en brouillon ou publiez-la immédiatement pour la rendre visible aux candidats.",
              },
              {
                n: "03",
                title: "Recrutez",
                text: "Suivez chaque candidature depuis sa réception jusqu'à la décision finale, et échangez directement avec les candidats.",
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-5">
                <span className="text-6xl font-semibold text-blue-200 dark:text-slate-700 shrink-0">{step.n}</span>
                <div className="pt-2">
                  <h3 className="font-bold text-lg text-blue-900 dark:text-blue-200">{step.title}</h3>
                  <p className="mt-2 text-gray-500 dark:text-slate-400 leading-7">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Notre mission ---------- */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700 dark:text-blue-400">
              Notre mission
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-blue-900 dark:text-blue-200 leading-tight">
              Rapprocher les employeurs des bons profils, sans complexité inutile.
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 dark:text-slate-400 leading-8">
              <p>
                En Haïti, le recrutement passe encore trop souvent par des annonces
                dispersées, des candidatures reçues par email et des suivis tenus sur
                des tableurs. PRCS regroupe ces étapes dans un espace unique, pensé
                pour les institutions, les entreprises et les recruteurs indépendants.
              </p>
              <p>
                L'objectif est simple : donner aux employeurs les moyens de publier
                une offre claire, de suivre chaque candidature avec précision et de
                communiquer directement avec les candidats, sans outil superflu.
              </p>
            </div>
          </div>
          <img
            src="/images/opportunities.jpg"
            alt="Publication d'une offre d'emploi"
            className="rounded-3xl w-full h-auto object-cover shadow-lg"
          />
        </div>
      </section>

      {/* ---------- CTA final : bloc plein qui repond au hero ---------- */}
      <section className="bg-blue-800 dark:bg-blue-950">
        <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold text-white max-w-lg leading-tight">
              Prêt à structurer votre recrutement ?
            </h2>
            <ul className="mt-6 space-y-2">
              {["Profil employeur public", "Offres et pipeline", "Messagerie candidat", "Entretiens et reporting"].map(
                (benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-blue-100">
                    <FaCheckCircle className="text-blue-300" /> {benefit}
                  </li>
                )
              )}
            </ul>
          </div>
          <Link
            to="/recruteur/inscription"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-blue-900 transition hover:bg-blue-50 shrink-0 self-start md:self-center"
          >
            Créer un compte entreprise <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
