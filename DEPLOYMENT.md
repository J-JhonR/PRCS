# Deployer PRCS en ligne gratuitement (demo de soutenance)

Stack recommandee, entierement gratuite, sans carte bancaire :

| Partie | Hebergeur | Pourquoi |
|---|---|---|
| Frontend (React/Vite) | **Vercel** ou **Netlify** | Connexion directe avec votre compte GitHub, deploiement automatique a chaque push |
| Backend (Django API) | **Render** ou **Koyeb** | Free tier, connexion GitHub, detecte `Procfile` automatiquement |
| Base de donnees MySQL | **TiDB Cloud Serverless** (recommande) ou **Aiven** | Compatibles MySQL (le driver `mysqlclient` de Django s'y connecte sans rien changer au code) |

Le code est deja pret pour cette stack (voir section "Ce qui est deja configure").
Verifiez toujours les conditions du free tier au moment de l'inscription, ces
offres evoluent regulierement.

## 1. Base de donnees MySQL gratuite

### Option A — TiDB Cloud Serverless
1. Creez un compte sur [tidbcloud.com](https://tidbcloud.com), creez un cluster **Serverless** (gratuit).
2. Dans **Connect**, choisissez "General" / mysqlclient : vous obtenez `HOST`, `PORT` (4000), `USER`, `PASSWORD`, `DATABASE`.
3. Notez ces valeurs, TiDB exige TLS (voir variables `DB_SSL_*` plus bas).

### Option B — Aiven
1. Creez un compte sur [aiven.io](https://aiven.io), creez un service **MySQL**.
2. Recuperez `Host`, `Port`, `User`, `Password`, `Database name` dans l'onglet **Overview**.
3. Telechargez le certificat CA fourni (necessaire pour `DB_SSL_CA`).

## 2. Backend Django sur Render (ou Koyeb)

1. Sur [render.com](https://render.com), **New +** → **Web Service** → connectez le
   depot GitHub `PRCS`.
2. **Build Command** : `pip install -r requirements.txt`
   **Start Command** : `gunicorn backend.wsgi` (deja dans le `Procfile`, Render le detecte seul).
3. Onglet **Environment**, ajoutez ces variables (reprises de `.env.example`) :

   ```
   DEBUG=False
   SECRET_KEY=<generez une nouvelle valeur, jamais celle du repo>
   ALLOWED_HOSTS=votre-backend.onrender.com
   DB_NAME=... DB_USER=... DB_PASSWORD=... DB_HOST=... DB_PORT=...
   DB_SSL_REQUIRED=True
   DB_SSL_CA=            # laissez vide pour TiDB, chemin du certificat pour Aiven
   CORS_ALLOWED_ORIGINS=https://votre-frontend.vercel.app
   CSRF_TRUSTED_ORIGINS=https://votre-frontend.vercel.app
   COOKIE_SAMESITE=None
   FRONTEND_URL=https://votre-frontend.vercel.app
   EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
   ```

   **`COOKIE_SAMESITE=None` est indispensable** : le frontend (Vercel) et le
   backend (Render) sont sur des domaines differents. Sans ce reglage, le
   navigateur refuse d'envoyer le cookie de session sur les appels API et la
   connexion semble "ne pas fonctionner" alors que tout est bien configure.

4. Premier deploiement termine, ouvrez le **Shell** de Render (ou utilisez le
   "Job" de build) et lancez :
   ```
   python manage.py migrate
   python manage.py collectstatic --noinput
   python manage.py createsuperuser
   ```
5. Votre API est disponible sur `https://votre-backend.onrender.com`.

*(Koyeb suit les memes etapes : variables d'environnement identiques, commande
de demarrage `gunicorn backend.wsgi`.)*

## 3. Frontend React sur Vercel (ou Netlify)

1. Sur [vercel.com](https://vercel.com), **Add New → Project**, connectez le
   depot GitHub, **Root Directory** : `frontend`.
2. Build Command `npm run build`, Output Directory `dist` (detecte automatiquement pour Vite).
3. **Environment Variables** : `VITE_API_URL=https://votre-backend.onrender.com`
4. **Deploy**. Lien obtenu : `https://votre-projet.vercel.app`.
5. Retournez dans les variables d'environnement du backend (etape 2.3) et
   mettez `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` et `FRONTEND_URL` a
   jour avec cette URL Vercel exacte, puis redeployez le backend.

## Ce qui est deja configure dans le code

- `backend/settings.py` : CORS, CSRF, `ALLOWED_HOSTS`, cookies, base de
  donnees et email lisent tous des variables d'environnement — aucune
  modification de code necessaire, seulement les variables ci-dessus.
- `whitenoise` sert les fichiers statiques (CSS/JS admin, DRF) directement
  depuis Django, sans configuration serveur supplementaire.
- `requirements.txt` inclut `gunicorn` (serveur de production) et
  `whitenoise`.
- `Procfile` (`web: gunicorn backend.wsgi`) est detecte automatiquement par
  Render/Koyeb/Heroku-like.
- `DB_SSL_REQUIRED` + `DB_SSL_CA` : active une connexion MySQL chiffree (TLS),
  necessaire pour TiDB Cloud et Aiven.
- `COOKIE_SAMESITE` : passe les cookies de session en mode compatible
  cross-domaine quand c'est necessaire (voir etape 2.3).

## Limites du free tier a connaitre

- Les fichiers uploades (CV, photos, logos) sont stockes sur le disque du
  service Render gratuit, qui peut etre reinitialise en cas de redeploiement
  — suffisant pour une demonstration, pas pour un usage long terme.
- Un service Render gratuit se met en veille apres inactivite ; le premier
  chargement apres une pause peut prendre 30-60 secondes.
