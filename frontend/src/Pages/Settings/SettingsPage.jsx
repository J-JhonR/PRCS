import React, { useState } from "react";
import { FaBell, FaLock, FaShieldAlt, FaUserCog } from "react-icons/fa";

import { useAuth } from "../../context/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [jobRecommendations, setJobRecommendations] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-700 font-semibold">
            Parametres
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Gerer mon compte</h1>
          <p className="text-slate-500 mt-3 max-w-3xl">
            Personnalisez vos notifications, la visibilite de votre profil et les parametres
            de securite de votre compte candidat.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="space-y-6">
            <SettingsBlock
              icon={<FaBell />}
              title="Notifications"
              description="Choisissez comment vous souhaitez etre informe des nouvelles opportunites."
            >
              <ToggleRow
                label="Alertes email"
                description="Recevoir un email lorsqu'une candidature evolue."
                checked={emailAlerts}
                onChange={() => setEmailAlerts((prev) => !prev)}
              />
              <ToggleRow
                label="Suggestions d'offres"
                description="Recevoir des recommandations selon votre profil."
                checked={jobRecommendations}
                onChange={() => setJobRecommendations((prev) => !prev)}
              />
            </SettingsBlock>

            <SettingsBlock
              icon={<FaUserCog />}
              title="Visibilite du profil"
              description="Controlez la facon dont les recruteurs peuvent consulter votre profil."
            >
              <ToggleRow
                label="Profil visible"
                description="Autoriser les recruteurs a voir votre profil candidat."
                checked={profileVisibility}
                onChange={() => setProfileVisibility((prev) => !prev)}
              />
            </SettingsBlock>

            <SettingsBlock
              icon={<FaLock />}
              title="Securite"
              description="Mettez a jour vos informations sensibles et protegeez votre compte."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="rounded-2xl border border-slate-200 px-4 py-4 text-left hover:border-blue-300 hover:bg-blue-50 transition">
                  <p className="font-medium text-slate-900">Changer le mot de passe</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Mettez a jour votre mot de passe regulierement.
                  </p>
                </button>
                <button className="rounded-2xl border border-slate-200 px-4 py-4 text-left hover:border-blue-300 hover:bg-blue-50 transition">
                  <p className="font-medium text-slate-900">Verifier mon email</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Adresse actuelle : {user?.email || "Aucune adresse"}
                  </p>
                </button>
              </div>
            </SettingsBlock>
          </div>

          <aside className="space-y-6">
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                  <FaShieldAlt />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">Etat du compte</h3>
                  <p className="text-sm text-slate-500">Compte candidat actif</p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <StatusPill label="Email principal enregistre" tone="success" />
                <StatusPill label="Profil accessible" tone="info" />
                <StatusPill label="Double verification a activer plus tard" tone="warning" />
              </div>
            </section>

            <section className="bg-slate-900 rounded-3xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold">Bon a savoir</h3>
              <p className="text-slate-300 leading-7 mt-3">
                Ces parametres sont une bonne base pour votre espace candidat. Ensuite, on
                pourra les connecter au backend pour les sauvegarder en base.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SettingsBlock({ icon, title, description, children }) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <span className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0">
          {icon}
        </span>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-slate-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-4">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 w-6 h-6 rounded-full bg-white transition ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function StatusPill({ label, tone }) {
  const tones = {
    success: "bg-emerald-100 text-emerald-700",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-amber-100 text-amber-700",
  };

  return (
    <div className={`rounded-full px-4 py-2 text-sm font-medium ${tones[tone] || tones.info}`}>
      {label}
    </div>
  );
}
