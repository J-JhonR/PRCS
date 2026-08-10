import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import { PageHeader } from "../components/RecruiterCards";
import { apiFetch, apiGetJSON } from "../../../lib/api";
import { useAuth } from "../../../context/useAuth";

export default function RecruiterMessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [activeId, setActiveId] = useState(searchParams.get("application") || null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoadingApplications(true);
        const data = await apiGetJSON("/api/recruitment/recruiter/applications/");
        const list = Array.isArray(data) ? data : data.results || [];
        setApplications(list);
        if (!activeId && list.length > 0) {
          setActiveId(String(list[0].id));
        }
      } catch (err) {
        setError(err.message || "Impossible de charger les conversations.");
      } finally {
        setLoadingApplications(false);
      }
    };

    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setSearchParams({ application: activeId }, { replace: true });

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const data = await apiGetJSON(`/api/recruitment/applications/${activeId}/messages/`);
        setMessages(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message || "Impossible de charger les messages.");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const activeApplication = applications.find((app) => String(app.id) === String(activeId));

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeId) return;

    try {
      setSending(true);
      const response = await apiFetch(`/api/recruitment/applications/${activeId}/messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || "Envoi impossible.");
      setMessages((prev) => [...prev, data]);
      setDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Messagerie"
        title="Echanges entreprise-candidat"
        description="Conversations liees aux candidatures recues."
      />

      {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="grid min-h-[620px] grid-cols-1 overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 lg:grid-cols-[0.38fr_0.62fr]">
        <aside className="border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
          {loadingApplications ? (
            <div className="flex items-center justify-center gap-3 p-6 text-slate-500 dark:text-slate-400">
              <FaSpinner className="animate-spin" /> Chargement...
            </div>
          ) : applications.length === 0 ? (
            <p className="p-6 text-slate-500 dark:text-slate-400">Aucune candidature a contacter.</p>
          ) : (
            applications.map((application) => (
              <button
                key={application.id}
                onClick={() => setActiveId(String(application.id))}
                className={`block w-full border-b border-slate-100 p-4 text-left ${
                  String(activeId) === String(application.id) ? "bg-blue-600 text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <p className="font-semibold">{application.candidate_name}</p>
                <p className={`mt-1 text-sm ${String(activeId) === String(application.id) ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                  {application.job_offer_title}
                </p>
              </button>
            ))
          )}
        </aside>
        <div className="flex flex-col">
          {activeApplication ? (
            <>
              <header className="border-b border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-xl font-semibold">{activeApplication.candidate_name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{activeApplication.job_offer_title}</p>
              </header>
              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 dark:bg-slate-800 p-5">
                {loadingMessages ? (
                  <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                    <FaSpinner className="animate-spin" /> Chargement...
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400">Aucun message pour le moment.</p>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender === user?.id;
                    return (
                      <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-md rounded-3xl px-5 py-3 ${isMe ? "bg-blue-600 text-white" : "bg-white text-slate-800 shadow-sm"}`}>
                          <p>{message.body}</p>
                          <p className="mt-2 text-xs opacity-70">
                            {message.sender_name} · {new Date(message.created_at).toLocaleString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <footer className="border-t border-slate-200 dark:border-slate-700 p-4">
                <form onSubmit={handleSend} className="flex items-center gap-3 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    placeholder="Ecrire un message..."
                  />
                  <button type="submit" disabled={sending} className="rounded-xl bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-70">
                    {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-500 dark:text-slate-400">
              Selectionnez une conversation.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
