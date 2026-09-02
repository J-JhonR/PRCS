import React, { useState } from "react";
import { IoChevronDown } from "react-icons/io5";

export default function FAQ() {
  const [open, setOpen] = useState(null);

  const questions = [
    {
      q: "L'envoi d'un CV est-il obligatoire ?",
      a: "Oui, un CV est obligatoire afin d'évaluer votre parcours et votre expérience.",
    },
    {
      q: "Le télétravail est-il possible pour ce poste ?",
      a: "Cela dépend du type de poste. Certaines positions permettent le télétravail complet ou partiel.",
    },
    {
      q: "Quelle est la durée du contrat ?",
      a: "La durée du contrat est indiquée dans la fiche du poste.",
    },
    {
      q: "Ai-je besoin d'une lettre de motivation ?",
      a: "Elle est fortement recommandée pour mettre en avant vos motivations.",
    },
  ];

  return (
    <section className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Questions fréquentes</h2>

      <div className="space-y-3">
        {questions.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => setOpen(open === index ? null : index)}
              className="w-full flex justify-between items-center text-left font-medium py-2 text-gray-700"
            >
              {item.q}
              <IoChevronDown
                className={`transition-transform ${open === index ? "rotate-180" : ""}`}
              />
            </button>

            {open === index && <p className="text-gray-600 pl-2 pb-2">{item.a}</p>}

            <hr className="border-gray-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
