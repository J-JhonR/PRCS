import React, { useEffect, useState } from "react";
import { FaBan, FaCheckCircle, FaSearch, FaSpinner } from "react-icons/fa";
import { PageHeader } from "../../Recruteur/components/RecruiterCards";
import { apiFetch, apiGetJSON } from "../../../lib/api";

const ROLE_LABELS = {
  candidat: "Candidat",
  recruteur: "Recruteur",
  admin: "Administrateur",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async (query = "") => {
    try {
      setLoading(true);
      const suffix = query ? `?search=${encodeURIComponent(query)}` : "";
      const data = await apiGetJSON(`/api/recruitment/admin/users/${suffix}`);
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadUsers(search);
  };

  const toggleActive = async (userItem) => {
    try {
      setUpdatingId(userItem.id);
      const response = await apiFetch(`/api/recruitment/admin/users/${userItem.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !userItem.is_active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || "Mise à jour impossible.");
      setUsers((prev) => prev.map((u) => (u.id === userItem.id ? data : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Utilisateurs"
        title="Gestion des comptes"
        description="Recherchez et suspendez un compte candidat, recruteur ou administrateur si nécessaire."
      />

      <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 rounded-[2rem] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <FaSearch className="text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full bg-transparent outline-none dark:text-white"
          placeholder="Rechercher par email..."
        />
      </form>

      {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-600 dark:text-slate-400">
          <FaSpinner className="animate-spin" /> Chargement...
        </div>
      ) : users.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
          Aucun utilisateur trouvé.
        </p>
      ) : (
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          {users.map((userItem) => (
            <div
              key={userItem.id}
              className="grid grid-cols-1 items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800 md:grid-cols-5"
            >
              <strong className="dark:text-white">{userItem.full_name}</strong>
              <span className="text-slate-600 dark:text-slate-400">{userItem.email}</span>
              <span className="text-slate-600 dark:text-slate-400">{ROLE_LABELS[userItem.role] || userItem.role}</span>
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  userItem.is_active
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                }`}
              >
                {userItem.is_active ? "Actif" : "Suspendu"}
              </span>
              <button
                onClick={() => toggleActive(userItem)}
                disabled={updatingId === userItem.id || userItem.role === "admin"}
                title={userItem.role === "admin" ? "Impossible de suspendre un administrateur" : ""}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                  userItem.is_active
                    ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300"
                }`}
              >
                {updatingId === userItem.id ? (
                  <FaSpinner className="animate-spin" />
                ) : userItem.is_active ? (
                  <FaBan />
                ) : (
                  <FaCheckCircle />
                )}
                {userItem.is_active ? "Suspendre" : "Réactiver"}
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
