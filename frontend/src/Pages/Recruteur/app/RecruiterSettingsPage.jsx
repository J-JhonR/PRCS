import React from "react";
import { FaLock, FaShieldAlt, FaUserPlus } from "react-icons/fa";
import { PageHeader } from "../components/RecruiterCards";

export default function RecruiterSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Parametres"
        title="Compte entreprise et securite"
        description="Gerez les utilisateurs, roles, permissions, notifications et options de securite."
      />
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SettingsCard icon={<FaUserPlus />} title="Utilisateurs" text="Inviter recruteurs, admins et responsables RH." />
        <SettingsCard icon={<FaShieldAlt />} title="Roles et permissions" text="Limiter l'acces aux offres, messages et candidatures." />
        <SettingsCard icon={<FaLock />} title="Securite" text="Sessions, mots de passe et verification du compte." />
      </section>
      <section className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {["Nouveau message candidat", "Nouvelle candidature", "Entretien confirme"].map((item) => (
          <label key={item} className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800 p-4">
            <span className="font-bold">{item}</span>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </label>
        ))}
      </section>
    </div>
  );
}

function SettingsCard({ icon, title, text }) {
  return (
    <article className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
      <div className="text-2xl text-blue-600">{icon}</div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">{text}</p>
    </article>
  );
}
