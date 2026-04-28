# GestionCours Pro

Application web **100 % sur mesure** de gestion d’établissement / centre de formation, structurée en 3 couches :

- **`/frontend`** → application **Next.js / React**
- **`/backend`** → API **Node.js / Express**
- **`/database`** → scripts **PostgreSQL** d’initialisation et d’évolution du schéma

---

## 1) Conformité au cahier des charges

Cette application respecte strictement le périmètre demandé :

- ✅ **Backend 100 % sur mesure** avec **Node.js / Express**
- ✅ **Base de données PostgreSQL** auto-hébergée
- ✅ **Authentification JWT + Refresh Tokens** implémentée
- ✅ **Mots de passe hashés avec bcrypt**
- ✅ **Sidebar UI fixée à gauche de l’écran** sur toute l’application Next.js
- ✅ **Modules couverts** :
  - Authentification
  - Membres
  - Cours + calendrier drag-and-drop
  - Écolages / finances
  - Présence / QR
  - Forum
  - Dashboard Admin final

---

## 2) Arborescence du projet

```txt
GestionCoursPro/
├── frontend/
├── backend/
├── database/
└── README.md
```

### Détail logique

```txt
frontend/   -> Interface utilisateur Next.js
backend/    -> API REST Express + logique métier
database/   -> Scripts SQL (schéma + migrations + seed admin)
```

---

## 3) Prérequis système

### Versions recommandées

- **Node.js** : `20.x LTS`
- **npm** : `10.x` ou supérieur
- **PostgreSQL** : `15.x` ou `16.x`
- **Git** : recommandé
- **psql** (client PostgreSQL CLI) : recommandé pour exécuter les scripts SQL

### Vérification rapide

```bash
node -v
npm -v
psql --version
```

---

## 4) Variables d’environnement

---

### 4.1 Backend — fichier `.env`

Créer le fichier :

```txt
backend/.env
```

Contenu exact recommandé :

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestioncourspro
DB_USER=postgres
DB_PASSWORD=postgres

JWT_ACCESS_SECRET=change_me_access_secret_very_strong
JWT_REFRESH_SECRET=change_me_refresh_secret_very_strong
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SUCCESS_URL=http://localhost:3000/ecolages?payment=success
STRIPE_CANCEL_URL=http://localhost:3000/ecolages?payment=cancel

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

> Remarque :
> - si `STRIPE_SECRET_KEY` est vide, l’application fonctionne en **mode mock Stripe**.
> - Twilio est préparé mais simulé si aucune clé n’est fournie.

---

### 4.2 Frontend — fichier `.env.local`

Créer le fichier :

```txt
frontend/.env.local
```

Contenu exact :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 5) Création de la base PostgreSQL

Se connecter à PostgreSQL puis créer la base :

```sql
CREATE DATABASE gestioncourspro;
```

Ou via CLI :

```bash
createdb -U postgres gestioncourspro
```

---

## 6) Exécution des scripts SQL

Les scripts doivent être exécutés **dans cet ordre exact**.

Depuis la racine du projet :

```bash
psql -U postgres -d gestioncourspro -f database/001_schema.sql
psql -U postgres -d gestioncourspro -f database/002_seed_admin.sql
psql -U postgres -d gestioncourspro -f database/003_members_module.sql
psql -U postgres -d gestioncourspro -f database/004_courses_module.sql
psql -U postgres -d gestioncourspro -f database/005_finance_module.sql
psql -U postgres -d gestioncourspro -f database/006_presence_module.sql
psql -U postgres -d gestioncourspro -f database/007_forum_dashboard.sql
```

### Résultat attendu

- schéma métier complet créé
- tables techniques d’auth créées
- modules enrichis progressivement
- **compte admin par défaut injecté**

---

## 7) Compte admin par défaut

Après exécution de `002_seed_admin.sql` :

- **Email** : `admin@ecole.fr`
- **Mot de passe initial** : `Admin123!ChangeMe`

> ⚠️ À changer dès la première connexion en environnement réel.

---

## 8) Installation du backend

Depuis la racine du projet :

```bash
cd backend
npm install
```

### Lancer le backend en développement

```bash
npm run dev
```

### URL de l’API

```txt
http://localhost:5000
```

### Endpoint de santé

```txt
GET http://localhost:5000/api/health
```

---

## 9) Installation du frontend

Dans un autre terminal :

```bash
cd frontend
npm install
```

### Lancer le frontend en développement

```bash
npm run dev
```

### URL de l’interface

```txt
http://localhost:3000
```

---

## 10) Démarrage complet (ordre recommandé)

### Terminal 1 — PostgreSQL
Assure-toi que PostgreSQL tourne.

### Terminal 2 — Backend

```bash
cd backend
npm install
npm run dev
```

### Terminal 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 11) Authentification

### Login admin

```http
POST /api/auth/login
Content-Type: application/json
```

Body :

```json
{
  "email": "admin@ecole.fr",
  "password": "Admin123!ChangeMe"
}
```

La réponse retourne :

- `accessToken`
- `refreshToken`
- `user`

### Côté frontend
Après login, stocker :

```js
localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("refreshToken", data.refreshToken);
```

Tous les appels API du frontend utilisent ensuite automatiquement le JWT via `Authorization: Bearer <token>`.

---

## 12) Modules inclus dans le MVP final

### 12.1 Membres
- recherche par nom / email
- filtre par rôle / statut
- création / édition / suppression
- import CSV
- upload photo

### 12.2 Cours
- création complète
- calendrier hebdomadaire 7 colonnes × 24h
- drag-and-drop des sessions
- export PDF via impression navigateur

### 12.3 Écolages
- calcul automatique
- statuts payé / partiel / impayé
- Stripe mock / réel
- rappels automatiques via cron
- facture PDF
- graphique du taux de recouvrement

### 12.4 Présence
- génération de token QR par session
- scan / validation présence
- gestion manuelle présent / absent / retard
- rapports + exports CSV / PDF
- alertes absences cumulées

### 12.5 Forum
- espace global
- espace par cours
- posts + réponses + likes
- upload image / PDF < 5 Mo
- recherche plein texte PostgreSQL
- signalement spam

### 12.6 Dashboard Admin
- cartes synthèse :
  - nombre de cours
  - recettes totales
  - présence moyenne
  - utilisateurs actifs
- graphiques :
  - paiements mensuels
  - taux d’absence

---

## 13) Notes techniques importantes

### Sidebar fixée à gauche
La navigation principale est implémentée dans :

```txt
frontend/components/layout/Sidebar.js
```

Elle est **fixée à gauche** avec :

```css
fixed left-0 top-0 h-screen
```

### Auth sans service externe
- aucune dépendance Supabase / Firebase
- auth maison avec :
  - `jsonwebtoken`
  - `bcrypt`
  - `refresh_tokens` en base

### Recherche forum optimisée
Le forum utilise un `tsvector` + index GIN pour accélérer la recherche :

- `posts.search_vector`
- `idx_posts_search_vector`

### Cron job financier
Le serveur démarre un cron via `node-cron` pour détecter les impayés > 7 jours et simuler l’envoi de rappels.

---

## 14) Commandes résumées (copier-coller)

### 1. Créer la base

```bash
createdb -U postgres gestioncourspro
```

### 2. Exécuter les scripts SQL

```bash
psql -U postgres -d gestioncourspro -f database/001_schema.sql
psql -U postgres -d gestioncourspro -f database/002_seed_admin.sql
psql -U postgres -d gestioncourspro -f database/003_members_module.sql
psql -U postgres -d gestioncourspro -f database/004_courses_module.sql
psql -U postgres -d gestioncourspro -f database/005_finance_module.sql
psql -U postgres -d gestioncourspro -f database/006_presence_module.sql
psql -U postgres -d gestioncourspro -f database/007_forum_dashboard.sql
```

### 3. Installer et lancer le backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 4. Installer et lancer le frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

---

## 15) Dépannage rapide

### Erreur PostgreSQL de connexion
Vérifier :
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- que le service PostgreSQL tourne

### Erreur CORS
Vérifier dans `backend/.env` :

```env
FRONTEND_URL=http://localhost:3000
```

### Sidebar non visible
Vérifier que les composants layout sont bien présents :
- `frontend/components/layout/Sidebar.js`
- `frontend/components/layout/Header.js`
- `frontend/components/layout/AppShell.js`

---

## 16) Production (recommandations)

Pour une mise en production ultérieure :
- reverse proxy **Nginx**
- process manager **PM2**
- stockage externe pour uploads
- rotation / invalidation avancée des refresh tokens
- validation stricte des inputs
- logs structurés
- sauvegardes PostgreSQL
- HTTPS obligatoire

---

## 17) Licence / usage

Projet MVP pédagogique / technique pour démontrer une architecture **full-stack sur mesure** conforme au cahier des charges demandé.
