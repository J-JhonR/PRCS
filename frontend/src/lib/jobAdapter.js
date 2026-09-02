import { API_ORIGIN } from "./api";

export const EMPLOYMENT_LABELS = {
  cdi: "CDI",
  cdd: "CDD",
  freelance: "Freelance",
  internship: "Stage",
};

export function resolveMediaUrl(path) {
  if (!path) return null;
  const value = String(path);
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

function relativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "aujourd'hui";
  if (diffDays === 1) return "1 jour";
  if (diffDays < 30) return `${diffDays} jours`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} mois`;
}

function splitLines(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function mapJobOffer(offer) {
  const salary =
    offer.salary_min || offer.salary_max
      ? `${offer.salary_min || "?"} - ${offer.salary_max || "?"} ${offer.currency || ""}`.trim()
      : "À définir";

  return {
    id: offer.id,
    title: offer.title,
    company: offer.company?.name || "",
    companyId: offer.company?.id,
    location: offer.location,
    workplace_type: offer.workplace_type,
    employment_type: offer.employment_type,
    type: EMPLOYMENT_LABELS[offer.employment_type] || offer.employment_type,
    sector: offer.company?.sector || "",
    posted: relativeTime(offer.published_at || offer.created_at),
    salary,
    logo: resolveMediaUrl(offer.company?.logo) || "/logos/default.png",
    banner: resolveMediaUrl(offer.company?.banner) || "/banners/default.JPG",
    description: offer.description,
    seniority: offer.experience_level,
    profile: splitLines(offer.requirements),
    benefits: splitLines(offer.benefits),
    companyDescription: offer.company?.description || "",
    steps: [],
    status: offer.status,
  };
}
