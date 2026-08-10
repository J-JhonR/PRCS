import React, { useState } from "react";
import { FaBuilding, FaCheckCircle, FaEnvelope, FaPhone, FaUserTie } from "react-icons/fa";
import RecruiterPublicNav from "../components/RecruiterPublicNav";

const emptyForm = { name: "", company: "", email: "", phone: "", message: "" };

export default function RecruiterContactDemoPage() {
  const [form, setForm] = useState(emptyForm);
  const [sent, setSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 font-poppins">
      <RecruiterPublicNav />
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold text-blue-900 dark:text-blue-200 md:text-5xl leading-tight">
            Une question sur PRCS ?
          </h1>
          <p className="mt-5 leading-8 text-slate-600 dark:text-slate-400">
            Que vous ayez une question sur la plateforme, un problème technique ou
            une suggestion, écrivez-nous. Nous répondons directement, sans détour.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-start justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <FaCheckCircle className="text-3xl text-emerald-500" />
            <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Message envoyé</h2>
            <p className="text-sm text-emerald-800 dark:text-emerald-300/80">
              Merci {form.name || ""}, nous vous répondrons rapidement à l'adresse fournie.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field icon={<FaUserTie />} name="name" label="Nom responsable" value={form.name} onChange={handleChange} required />
              <Field icon={<FaBuilding />} name="company" label="Entreprise / Institution" value={form.company} onChange={handleChange} required />
              <Field icon={<FaEnvelope />} name="email" label="Email professionnel" type="email" value={form.email} onChange={handleChange} required />
              <Field icon={<FaPhone />} name="phone" label="Telephone" value={form.phone} onChange={handleChange} />
            </div>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="mt-4 min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Votre message..."
            />
            <button type="submit" className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500">
              Envoyer le message
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function Field({ icon, label, name, value, onChange, type = "text", required }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
      <span className="text-slate-400">{icon}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={label}
        required={required}
        className="w-full bg-transparent text-sm outline-none dark:text-white"
      />
    </label>
  );
}
