import { resolveMediaUrl } from "./jobAdapter";

export const SIZE_LABELS = {
  self: "Independant",
  "1-10": "1-10 employes",
  "11-50": "11-50 employes",
  "51-200": "51-200 employes",
  "201-500": "201-500 employes",
  "500+": "500+ employes",
};

export function mapCompany(company, offersCount = 0) {
  return {
    id: company.id,
    name: company.name,
    sector: company.sector,
    location: company.location,
    employees: SIZE_LABELS[company.size] || company.size,
    sizeCode: company.size,
    offers: offersCount,
    logo: resolveMediaUrl(company.logo),
    banner: resolveMediaUrl(company.banner),
    description: company.description,
    website: company.website,
    videoUrl: company.video_url || "",
    photos: (company.photos || []).map((photo) => ({
      id: photo.id,
      url: resolveMediaUrl(photo.image),
      caption: photo.caption,
    })),
    employerType: company.employer_type,
  };
}

// Convertit un lien YouTube/Vimeo "classique" en URL embarquable dans un <iframe>.
export function getVideoEmbedUrl(url) {
  if (!url) return null;

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export function countOffersByCompany(jobs) {
  const counts = new Map();
  jobs.forEach((job) => {
    const companyId = job.company?.id ?? job.company;
    counts.set(companyId, (counts.get(companyId) || 0) + 1);
  });
  return counts;
}
