# TODO - Finalisation plateforme PRCS
Statut: ✅ Terminé (finalisation sécurité + liaison des pages)

## Résumé des travaux effectués

### Sécurité backend
- Secrets (SECRET_KEY, mot de passe MySQL) déplacés dans `.env` (voir `.env.example`)
- `DEBUG`, cookies sécurisés, `ALLOWED_HOSTS` pilotés par variables d'environnement
- Permissions par défaut passées à `IsAuthenticated` (`AllowAny` explicite sur les vues publiques)
- Faille OTP corrigée : le code de réinitialisation n'est plus renvoyé dans la réponse HTTP, il est envoyé par email
- Élévation de rôle bloquée : impossible de s'inscrire avec `role: "admin"`
- Validation de mot de passe (`validate_password`) et de type de fichier CV
- Throttling sur login/register/reset password
- Offres non publiées (brouillons) non visibles publiquement

### Module recruteur (backend)
- Nouveaux modèles `Message` et `Interview`
- Endpoints CRUD complets : entreprise, offres, candidatures reçues, messages, entretiens, statistiques
- Permissions par propriétaire (`IsRecruiterOfCompany`) empêchant un recruteur d'accéder aux données d'une autre entreprise

### Frontend
- Routing unifié dans `App.jsx`, zone `/recruteur/app/*` protégée par rôle
- Page 404, liens du footer corrigés, config API centralisée (`src/lib/api.js`)
- Jobs, détail d'offre, candidature (`ApplyModal`), liste de candidatures connectés au vrai backend
- Tout le module recruteur (dashboard, offres, candidatures, entreprise, messages, entretiens, analytics) connecté au vrai backend
- Sélecteur de rôle candidat/recruteur à l'inscription

## Suivi initial (résolu)
- ✅ Étape 1-7 du plan initial (Profile/Dashboard) : les endpoints `jobapplication/`→`applications/` et `joboffer/`→`jobs/` sont corrigés et fonctionnels.

## Pistes restantes (hors urgence sécurité, à faire au besoin)
- Upload logo/bannière entreprise (formulaire prêt, backend accepte déjà `logo`/`banner`)
- Gestion multi-utilisateurs côté recruteur (page Paramètres encore décorative)
- Notes internes candidat (pas de modèle backend dédié)
