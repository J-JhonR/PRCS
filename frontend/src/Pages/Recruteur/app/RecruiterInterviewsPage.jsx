import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaCalendarPlus, FaMagic, FaSpinner, FaVideo } from "react-icons/fa";
import { PageHeader } from "../components/RecruiterCards";
import { apiFetch, apiGetJSON } from "../../../lib/api";

// Genere un lien de visioconference Jitsi Meet (gratuit, sans compte) avec un
// identifiant de salle imprevisible pour eviter qu'un tiers ne devine l'URL.
function generateVideoCallLink() {
  const roomId = crypto.randomUUID().replace(/-/g, "");
  return `https://meet.jit.si/PRCS-${roomId}`;
}

const STATUS_LABELS = {
  scheduled: "Planifie",
  confirmed: "Confirme",
  done: "Termine",
  cancelled: "Annule",
};

export default function RecruiterInterviewsPage() {
  const [searchParams] = useSearchParams();
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(Boolean(searchParams.get("application")));
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    job_application: searchParams.get("application") || "",
    scheduled_at: "",
    mode: "remote",
    location_or_link: "",
    notes: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [interviewsData, applicationsData] = await Promise.all([
        apiGetJSON("/api/recruitment/recruiter/interviews/"),
        apiGetJSON("/api/recruitment/recruiter/applications/"),
      ]);
      setInterviews(Array.isArray(interviewsData) ? interviewsData : interviewsData.results || []);
      setApplications(Array.isArray(applicationsData) ? applicationsData : applicationsData.results || []);
    } catch (err) {
      setError(err.message || "Impossible de charger les entretiens.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const response = await apiFetch("/api/recruitment/recruiter/interviews/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.job_application?.[0] || data.error || data.detail || "Impossible de planifier l'entretien.");
      }
      setInterviews((prev) => [...prev, data]);
      setShowForm(false);
      setForm({ job_application: "", scheduled_at: "", mode: "remote", location_or_link: "", notes: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Entretiens"
        title="Planification des entretiens"
        description="Suivez les entretiens, confirmations candidats et liens visioconference."
        action={
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <FaCalendarPlus /> Planifier
          </button>
        }
      />

      {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Candidature</span>
            <select
              name="job_application"
              value={form.job_application}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="">Selectionner une candidature</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.candidate_name} - {application.job_offer_title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-700">Date et heure</span>
            <input
              type="datetime-local"
              name="scheduled_at"
              value={form.scheduled_at}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-700">Mode</span>
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="remote">Visio</option>
              <option value="onsite">Presentiel</option>
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Lien visio / adresse</span>
            <div className="mt-2 flex gap-2">
              <input
                name="location_or_link"
                value={form.location_or_link}
                onChange={handleChange}
                placeholder="https://... ou adresse physique"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-600"
              />
              {form.mode === "remote" && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, location_or_link: generateVideoCallLink() }))}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  <FaMagic /> Generer un lien
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Le lien genere ouvre une salle de visioconference gratuite (Jitsi Meet), sans compte requis.
            </p>
          </label>
          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaCalendarPlus />} Confirmer la planification
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-600 dark:text-slate-400">
          <FaSpinner className="animate-spin" /> Chargement...
        </div>
      ) : interviews.length === 0 ? (
        <p className="rounded-2xl bg-white dark:bg-slate-900 p-6 text-center text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          Aucun entretien planifie.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {interviews.map((interview) => {
            const date = new Date(interview.scheduled_at);
            return (
              <article key={interview.id} className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{interview.candidate_name}</h2>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{interview.job_offer_title}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {STATUS_LABELS[interview.status] || interview.status}
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                  <Info label="Date" value={date.toLocaleDateString("fr-FR")} />
                  <Info label="Heure" value={date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} />
                  <Info label="Mode" value={interview.mode === "remote" ? "Visio" : "Presentiel"} />
                </div>
                {interview.location_or_link && (
                  <a
                    href={interview.location_or_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
                  >
                    <FaVideo /> Lien / adresse
                  </a>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-3">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
