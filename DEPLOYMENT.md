# Publier PRCS sur GitHub et en ligne gratuitement

Ce guide explique comment publier le code source sur GitHub, puis rendre le
site accessible en ligne gratuitement, pour le présenter (ex: à un professeur).

## 1. Publier le code sur GitHub

Le dépôt Git local est déjà initialisé et le code est prêt (`.env` et les
secrets ne seront jamais envoyés, ils sont exclus via `.gitignore`).

1. Créez un compte sur [github.com](https://github.com) si vous n'en avez pas.
2. Cliquez sur **New repository**, nommez-le par exemple `prcs`, laissez-le
   **Public** (pour un lien accessible gratuitement), ne cochez aucune case
   d'initialisation (pas de README/licence — le dépôt local en a déjà).
3. Copiez l'URL du dépôt vide qui s'affiche (ex: `https://github.com/votre-nom/prcs.git`).
4. Dans le terminal, à la racine du projet :

```bash
git add .
git commit -m "Version initiale de PRCS"
git branch -M main
git remote add origin https://github.com/votre-nom/prcs.git
git push -u origin main
```

Le lien `https://github.com/votre-nom/prcs` est votre lien de présentation du
code, gratuit et public.

## 2. Héberger le backend gratuitement (PythonAnywhere)

[PythonAnywhere](https://www.pythonanywhere.com) offre un compte gratuit
permanent avec une base MySQL gratuite incluse — pas besoin de changer de base
de données.

1. Créez un compte gratuit ("Beginner").
2. Onglet **Consoles** → ouvrez une console Bash, puis :
   ```bash
   git clone https://github.com/votre-nom/prcs.git
   cd prcs
   mkvirtualenv --python=python3.10 prcs-env
   pip install -r requirements.txt
   ```
3. Onglet **Databases** : créez votre base MySQL gratuite, notez le nom
   d'hôte, le nom de la base et votre mot de passe MySQL PythonAnywhere.
4. Créez un fichier `.env` à la racine du projet cloné (via l'éditeur de
   fichiers PythonAnywhere) en reprenant `.env.example`, avec vos vraies
   valeurs (base MySQL de l'étape 3, `ALLOWED_HOSTS=votre-nom.pythonanywhere.com`,
   `DEBUG=False`, `FRONTEND_URL=` l'URL Vercel de l'étape 3 ci-dessous).
5. Onglet **Web** → **Add a new web app** → Manual configuration → Python
   correspondant à votre virtualenv. Pointez le fichier WSGI vers
   `backend/wsgi.py` et le virtualenv vers `prcs-env`.
6. Toujours en console : `python manage.py migrate` puis
   `python manage.py collectstatic --noinput` puis
   `python manage.py createsuperuser` (pour votre compte administrateur).
7. Rechargez l'application web ("Reload"). Votre API est en ligne sur
   `https://votre-nom.pythonanywhere.com`.

## 3. Héberger le frontend gratuitement (Vercel)

1. Créez un compte gratuit sur [vercel.com](https://vercel.com) (connexion
   possible directement avec GitHub).
2. **Add New → Project**, sélectionnez le dépôt `prcs`.
3. **Root Directory** : `frontend`.
4. **Build command** : `npm run build`, **Output directory** : `dist`
   (Vercel les détecte automatiquement pour un projet Vite).
5. Dans **Environment Variables**, ajoutez `VITE_API_URL` avec l'URL de votre
   backend PythonAnywhere (ex: `https://votre-nom.pythonanywhere.com`).
6. Cliquez **Deploy**. Vercel donne un lien public gratuit du type
   `https://prcs-votre-nom.vercel.app` — c'est le lien à présenter en ligne.
7. Retournez dans le `.env` du backend (étape 2.4) et mettez à jour
   `CORS_ALLOWED_ORIGINS` et `CSRF_TRUSTED_ORIGINS` avec cette URL Vercel,
   puis rechargez l'application web PythonAnywhere.

## Limites à connaître (compte gratuit)

- Les fichiers médias (CV, photos, logos) uploadés sont stockés sur le disque
  du serveur gratuit — pas de garantie de conservation à très long terme, mais
  suffisant pour une démonstration.
- PythonAnywhere gratuit limite les requêtes sortantes à une liste de domaines
  autorisés ; l'API elle-même reste pleinement accessible depuis l'extérieur.
- Aucune carte bancaire n'est demandée pour ces deux services en formule
  gratuite.
