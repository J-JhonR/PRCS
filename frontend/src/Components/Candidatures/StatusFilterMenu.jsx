import React, { useState, useRef, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import {
  PiArrowSquareInBold,
  PiCheckCircleBold,
  PiHourglassBold,
  PiXCircleBold,
} from "react-icons/pi";
import PropTypes from "prop-types";

const OPTIONS = [
  { id: "received", label: "Candidature reçue", icon: PiArrowSquareInBold },
  { id: "in_process", label: "Recrutement en cours", icon: PiHourglassBold },
  { id: "hired", label: "Vous avez le job !", icon: PiCheckCircleBold },
  { id: "declined", label: "Candidature déclinée", icon: PiXCircleBold },
];

export default function StatusFilterMenu({
  selectedStatuses,
  setSelectedStatuses,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Fermer le menu lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const toggleOption = (id) => {
    setSelectedStatuses((prev) =>
      prev.includes(id)
        ? prev.filter((status) => status !== id)
        : [...prev, id]
    );
  };

  const allSelected = selectedStatuses.length === OPTIONS.length;

  const handleToggleAll = () => {
    setSelectedStatuses(allSelected ? [] : OPTIONS.map((opt) => opt.id));
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Filtrer par statut"
      >
        <span>Statut</span>
        <IoChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-30"
          role="menu"
          aria-label="Options de filtre par statut"
        >
          <div className="p-3 space-y-2">
            <button
              type="button"
              onClick={handleToggleAll}
              className="w-full text-xs text-gray-500 mb-1 text-left hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded-sm"
              aria-label={
                allSelected ? "Tout décocher" : "Tout sélectionner"
              }
            >
              {allSelected ? "Tout décocher" : "Tout sélectionner"}
            </button>

            {OPTIONS.map((option) => {
              const Icon = option.icon;
              const isChecked = selectedStatuses.includes(option.id);
              return (
                <label
                  key={option.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-50 cursor-pointer"
                  role="menuitemcheckbox"
                  aria-checked={isChecked}
                >
                  <input
                    type="checkbox"
                    className="accent-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-0"
                    checked={isChecked}
                    onChange={() => toggleOption(option.id)}
                    aria-label={`Filtrer par ${option.label}`}
                  />
                  <Icon size={18} className="text-gray-600" aria-hidden="true" />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

StatusFilterMenu.propTypes = {
  selectedStatuses: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedStatuses: PropTypes.func.isRequired,
};    