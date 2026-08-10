import React from "react";

/* ---------- Petit helper pour les icônes de check ---------- */
const CheckIcon = () => (
  <svg
    className="h-3.5 w-3.5 shrink-0"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  MetricCard – ajout d’un effet de survol, contraste amélioré       */
/* ------------------------------------------------------------------ */
export function MetricCard({ label, value, trend, icon: Icon, className = "" }) {
  return (
    <article
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{value}</h3>
          {trend && (
            <p className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-400">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-2xl bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700">
            <Icon aria-hidden="true" />
          </div>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* ModuleCard – meilleurs contrastes, focus accessible (si interactif)*/
/* ------------------------------------------------------------------ */
export function ModuleCard({ title, description, icon: Icon, className = "" }) {
  return (
    <article
      className={`group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-500/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white transition-transform group-hover:scale-105">
        {Icon && <Icon aria-hidden="true" />}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">{description}</p>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* PricingCard – badge “Populaire”, icônes check, focus bouton        */
/* ------------------------------------------------------------------ */
export function PricingCard({ plan, className = "" }) {
  return (
    <article
      className={`relative rounded-[2rem] border p-6 shadow-sm transition-all duration-300 hover:shadow-lg ${
        plan.highlighted
          ? "border-blue-700 bg-gradient-to-br from-blue-700 to-blue-900 text-white"
          : "border-slate-200 bg-white text-slate-950 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-blue-800"
      } ${className}`}
    >
      {/* Badge “Populaire” pour le plan mis en avant */}
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow">
          Populaire
        </span>
      )}

      <p
        className={`text-sm font-bold ${
          plan.highlighted ? "text-blue-100" : "text-blue-600"
        }`}
      >
        {plan.name}
      </p>
      <h3 className="mt-4 text-3xl font-semibold">{plan.price}</h3>
      <p
        className={`mt-3 leading-7 ${
          plan.highlighted ? "text-slate-300" : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {plan.description}
      </p>

      <ul className="mt-6 space-y-3" role="list">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm font-semibold">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                plan.highlighted
                  ? "bg-blue-200 text-blue-900"
                  : "bg-blue-600 text-white"
              }`}
            >
              <CheckIcon />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`mt-7 w-full rounded-2xl px-5 py-3 font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          plan.highlighted
            ? "bg-white text-blue-800 hover:bg-blue-50 focus-visible:ring-white"
            : "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600"
        }`}
      >
        {plan.cta}
      </button>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* JobStatusBadge – français corrigé, rôle ARIA, plus accessible      */
/* ------------------------------------------------------------------ */
export function JobStatusBadge({ status, className = "" }) {
  const labels = {
    published: "Publiée",
    draft: "Brouillon",
    closed: "Fermée",
  };
  const tones = {
    published: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    draft: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    closed: "bg-slate-200 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
  };

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        tones[status] || tones.draft
      } ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" aria-hidden="true" />
      {labels[status] || status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* PageHeader – espacement optimisé, séparateur subtil sous l’eyebrow */
/* ------------------------------------------------------------------ */
export function PageHeader({ eyebrow, title, description, action, className = "" }) {
  return (
    <div
      className={`flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end dark:border-slate-800 ${className}`}
    >
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}