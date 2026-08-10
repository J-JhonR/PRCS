import React from "react";
import { IoClose } from "react-icons/io5";

export default function JobsFilters({ filters, setFilters, open, setOpen }) {
  // filtre local exemple
  const sectors = ["Tech", "Banque", "Marketing", "Finance", "Santé"];

  const toggleSector = (s) =>
    setFilters((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(s)
        ? prev.sectors.filter((x) => x !== s)
        : [...prev.sectors, s],
    }));

  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`z-50 bg-white rounded-xl shadow-md p-5 md:static fixed top-0 left-0 h-full md:h-auto w-72 transform transition-transform
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between mb-4 md:hidden">
          <h3 className="text-lg font-semibold">Filtres</h3>
          <button onClick={() => setOpen(false)}>
            <IoClose size={22} />
          </button>
        </div>

        <div className="hidden md:block mb-4">
          <h3 className="text-lg font-semibold">Filtres</h3>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Secteur</h4>
          {sectors.map((s) => (
            <label key={s} className="flex items-center gap-2 mb-2 text-sm">
              <input
                type="checkbox"
                checked={filters.sectors.includes(s)}
                onChange={() => toggleSector(s)}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Type</h4>
          {["CDI", "CDD", "Stage", "Freelance"].map((t) => (
            <label key={t} className="flex items-center gap-2 mb-2 text-sm">
              <input
                type="checkbox"
                checked={filters.types.includes(t)}
                onChange={() =>
                  setFilters((p) => ({
                    ...p,
                    types: p.types.includes(t)
                      ? p.types.filter((x) => x !== t)
                      : [...p.types, t],
                  }))
                }
              />
              <span>{t}</span>
            </label>
          ))}
        </div>

        <div>
          <h4 className="font-medium mb-2">Options</h4>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={() => setFilters((p) => ({ ...p, remote: !p.remote }))}
            />
            Télétravail possible
          </label>
        </div>
      </aside>
    </>
  );
}
