import {
  FaBell,
  FaBriefcase,
  FaBuilding,
  FaCalendarCheck,
  FaChartLine,
  FaComments,
  FaFileAlt,
  FaHandshake,
  FaLayerGroup,
  FaSearch,
  FaUsers,
} from "react-icons/fa";

export const recruiterModules = [
  {
    title: "Employer Branding",
    description: "Présentez votre culture, vos avantages, vos valeurs et vos photos d'équipe.",
    icon: FaHandshake,
  },
  {
    title: "Gestion des offres",
    description: "Créez, publiez, suspendez et optimisez vos offres depuis un espace unique.",
    icon: FaBriefcase,
  },
  {
    title: "ATS / Pipeline",
    description: "Suivez chaque candidat par étape : nouveau, en revue, entretien, décision.",
    icon: FaLayerGroup,
  },
  {
    title: "Matching intelligent",
    description: "Identifiez rapidement les profils les plus proches de vos besoins.",
    icon: FaSearch,
  },
  {
    title: "Messagerie RH",
    description: "Centralisez les échanges avec les candidats et gardez un historique complet.",
    icon: FaComments,
  },
  {
    title: "Entretiens",
    description: "Planifiez les entretiens, confirmez les disponibilités et partagez un lien visio.",
    icon: FaCalendarCheck,
  },
  {
    title: "Tableau de bord",
    description: "Pilotez vos offres, candidatures, messages et tâches en un coup d'œil.",
    icon: FaBell,
  },
  {
    title: "Reporting RH",
    description: "Mesurez la performance des offres, les sources et les délais de recrutement.",
    icon: FaChartLine,
  },
];

export const recruiterStats = [
  { label: "Offres suivies", value: "120+" },
  { label: "Candidatures traitées", value: "8k+" },
  { label: "Délai moyen gagné", value: "35%" },
  { label: "Messages centralisés", value: "100%" },
];

export const partnerLogos = ["PRCS", "Ayiti Bank", "Nova RH", "CaribTech", "Santé Plus"];

export const testimonials = [
  {
    company: "CaribTech",
    quote: "PRCS nous aide a garder une vue claire sur nos candidatures et nos entretiens.",
    author: "M. Louis, Responsable RH",
    result: "-28% de delai de traitement",
  },
  {
    company: "Santé Plus",
    quote: "La messagerie et le pipeline donnent une vraie discipline au recrutement.",
    author: "N. Pierre, Directrice administrative",
    result: "3x plus de suivi candidat",
  },
  {
    company: "Nova RH",
    quote: "L'espace employeur est simple, rassurant et adapte aux equipes qui grandissent.",
    author: "A. Jean, Consultante RH",
    result: "42 offres structurees",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "0 HTG",
    description: "Pour démarrer avec une présence employeur simple.",
    features: ["1 profil employeur", "2 offres actives", "Candidatures centralisées", "Messagerie basique"],
    cta: "Créer un compte",
  },
  {
    name: "Growth",
    price: "Sur devis",
    description: "Pour les entreprises qui recrutent régulièrement.",
    features: ["Offres illimitées", "Pipeline complet", "Modèles de messages", "Entretiens", "Analytics"],
    cta: "Demander une démo",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Personnalisé",
    description: "Pour institutions, groupes et équipes RH avancées.",
    features: ["Multi-utilisateurs", "Roles et permissions", "Reporting avancé", "Support prioritaire", "Intégrations"],
    cta: "Contacter PRCS",
  },
];

export const dashboardMetrics = [
  { label: "Offres publiees", value: "14", trend: "+3 ce mois-ci", icon: FaBriefcase },
  { label: "Candidatures recues", value: "248", trend: "+18 aujourd'hui", icon: FaUsers },
  { label: "Entretiens planifies", value: "9", trend: "4 cette semaine", icon: FaCalendarCheck },
  { label: "Messages non lus", value: "6", trend: "A traiter", icon: FaComments },
];

export const recruiterJobs = [
  {
    id: 1,
    title: "Developpeur Frontend React",
    location: "Port-au-Prince",
    type: "CDI",
    status: "published",
    applications: 34,
    createdAt: "2026-04-12",
    skills: ["React", "UI", "API REST"],
  },
  {
    id: 2,
    title: "Assistant administratif",
    location: "Petion-Ville",
    type: "CDD",
    status: "draft",
    applications: 0,
    createdAt: "2026-04-18",
    skills: ["Organisation", "Excel", "Accueil"],
  },
  {
    id: 3,
    title: "Responsable commercial",
    location: "Hybride",
    type: "CDI",
    status: "closed",
    applications: 57,
    createdAt: "2026-03-29",
    skills: ["Vente", "CRM", "Leadership"],
  },
];

export const applicationStages = [
  "Nouveau",
  "En revue",
  "Preselectionne",
  "Entretien",
  "Accepte",
  "Rejete",
];

export const candidates = [
  {
    id: 1,
    name: "Jacques Jhonson",
    title: "Developpeur Frontend",
    job: "Developpeur Frontend React",
    stage: "En revue",
    score: 86,
    skills: ["React", "Tailwind", "Django"],
    date: "2026-04-21",
  },
  {
    id: 2,
    name: "Mireille Jean",
    title: "Assistante administrative",
    job: "Assistant administratif",
    stage: "Nouveau",
    score: 74,
    skills: ["Excel", "Communication"],
    date: "2026-04-20",
  },
  {
    id: 3,
    name: "Samuel Pierre",
    title: "Commercial senior",
    job: "Responsable commercial",
    stage: "Entretien",
    score: 91,
    skills: ["CRM", "Negociation"],
    date: "2026-04-19",
  },
  {
    id: 4,
    name: "Nadia Joseph",
    title: "Developpeuse React",
    job: "Developpeur Frontend React",
    stage: "Preselectionne",
    score: 88,
    skills: ["React", "Accessibilite"],
    date: "2026-04-18",
  },
];

export const conversations = [
  {
    id: 1,
    candidate: "Jacques Jhonson",
    job: "Developpeur Frontend React",
    unread: true,
    messages: [
      { from: "candidate", body: "Bonjour, je reste disponible pour toute information.", time: "09:14" },
      { from: "recruiter", body: "Merci Jacques. Pouvez-vous partager votre portfolio ?", time: "09:32" },
    ],
  },
  {
    id: 2,
    candidate: "Mireille Jean",
    job: "Assistant administratif",
    unread: false,
    messages: [
      { from: "recruiter", body: "Bonjour Mireille, merci pour votre candidature.", time: "Hier" },
    ],
  },
];

export const interviews = [
  { id: 1, candidate: "Samuel Pierre", job: "Responsable commercial", date: "2026-04-24", time: "10:00", mode: "Visio", status: "Confirme" },
  { id: 2, candidate: "Nadia Joseph", job: "Developpeur Frontend React", date: "2026-04-25", time: "14:30", mode: "Presentiel", status: "En attente" },
];

export const analyticsCards = [
  { label: "Taux de conversion", value: "18%", note: "Candidature vers entretien" },
  { label: "Delai moyen", value: "9 jours", note: "Publication vers decision" },
  { label: "Source principale", value: "Recherche PRCS", note: "44% des candidatures" },
  { label: "Taux de reponse", value: "76%", note: "Messages candidats" },
];

export const messageTemplates = [
  "Convocation a un entretien",
  "Demande d'informations complementaires",
  "Refus poli",
  "Suite favorable",
];

export const quickTasks = [
  { title: "Repondre a 6 messages", priority: "Important" },
  { title: "Valider 3 candidatures en revue", priority: "Aujourd'hui" },
  { title: "Completer la page entreprise", priority: "Cette semaine" },
];

export const documentTypes = [
  { title: "Profil public", description: "Page entreprise visible par les candidats", icon: FaFileAlt },
  { title: "Kit marque employeur", description: "Photos, culture, avantages et reseaux sociaux", icon: FaBuilding },
];
