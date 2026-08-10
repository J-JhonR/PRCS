// 4 statuts possibles pour une candidature
export const APPLICATION_STATUS = {
  RECEIVED: "received",          // Candidature reçue
  IN_PROCESS: "in_process",      // Recrutement en cours
  HIRED: "hired",                // Vous avez le job !
  DECLINED: "declined",          // Candidature déclinée
};

// Données mock (tu peux commencer avec un tableau vide si tu veux)
export const applicationsData = [
  {
    id: 1,
    title: "Développeur Fullstack React / Django",
    company: "PRCS",
    location: "Remote - Haïti",
    status: APPLICATION_STATUS.RECEIVED,
    appliedAt: "Il y a 2 jours",
  },
  {
    id: 2,
    title: "Chef de projet digital",
    company: "Sogebank",
    location: "Port-au-Prince",
    status: APPLICATION_STATUS.IN_PROCESS,
    appliedAt: "Il y a 5 jours",
  },
  {
    id: 3,
    title: "Technicien Réseau",
    company: "Digicel",
    location: "Delmas",
    status: APPLICATION_STATUS.DECLINED,
    appliedAt: "Il y a 1 semaine",
  },
];
