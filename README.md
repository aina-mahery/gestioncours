# GestionCours Pro

## Description du projet

**GestionCours Pro** est une application web de gestion complète d'un centre de formation, développée en **frontend uniquement** avec **React.js (Vite)**, **JavaScript**, **Tailwind CSS**, **React Router** et **i18next**.

L'application couvre les besoins métiers principaux d'un centre de formation autour de trois rôles :

- **Admin** : gestion globale, membres, cours, finances, présence, forum.
- **Formateur** : suivi des cours, présence et échanges pédagogiques.
- **Élève** : accès simulé à certaines fonctionnalités selon le rôle.

> **Important :** le projet est actuellement **100% frontend**. Tous les appels API (`GET`, `POST`, `PATCH`, `DELETE`) sont **mockés** avec des services JavaScript basés sur des `Promise` et des `setTimeout`.

---

## Fonctionnalités principales

### Authentification et structure générale
- Page de **connexion** avec simulation d'authentification.
- Génération d'un **faux JWT** côté frontend.
- Choix simulé du rôle utilisateur : **Admin**, **Formateur**, **Élève**.
- **Layout principal** avec :
  - Header
  - Barre de recherche
  - Switch de langue **FR / EN**
  - Profil utilisateur
  - Sidebar de navigation
- **Dashboard Admin** avec statistiques et emplacements graphiques.

### Gestion des Membres
- Recherche par nom / email
- Filtres par rôle / statut
- Import CSV simulé
- Tableau interactif
- Modal création / édition
- CRUD mocké côté frontend

### Gestion des Cours
- Calendrier hebdomadaire **7 jours × 24h**
- Blocs de cours colorés
- **Drag & Drop HTML5**
- Simulation `PATCH /api/cours/:id/planning`
- Modal **Nouveau Cours** avec validation frontend
- Export PDF simulé

### Gestion des Écolages
- Tableau financier complet
- Statuts : **Payé / Partiel / Impayé**
- Modal de paiement simulée **Stripe / PayPal**
- Génération de facture **PDF** via `jsPDF`
- Simulation rappel **SMS / Email** type Twilio
- Graphique **taux de recouvrement mensuel** via **Recharts**
- Calcul métier simulé :
  - montant fixe = **500€**
  - réduction fidélité = **10%**

### Gestion de la Présence
- Scan **QR Code simulé**
- Pointage manuel
- Statistiques de présence
- Mini graphique en barres par élève
- Export **Excel / PDF** simulé

### Forum de Discussion
- Espaces **Cours React** et **Global**
- Recherche par mots-clés
- Liste de posts avec likes, réponses et pièce jointe PDF simulée
- Création de nouveaux posts avec upload simulé

---

## Prérequis

- **Node.js** (version **18+ recommandée**)
- **npm**

Vérification :

```bash
node -v
npm -v
```

---

## Installation et lancement

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd gestioncours-pro
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le serveur de développement Vite

```bash
npm run dev
```

Application disponible en général sur :

```bash
http://localhost:5173
```

### 4. Générer le build de production

```bash
npm run build
```

### 5. Prévisualiser le build

```bash
npm run preview
```

---

## Scripts npm

```bash
npm run dev      # Lance le serveur de développement Vite
npm run build    # Génère le build de production
npm run preview  # Prévisualise le build de production
```

---

## Technologies utilisées

### Stack principale
- **React.js**
- **Vite**
- **JavaScript (ES6+)**
- **Tailwind CSS**
- **React Router DOM**
- **i18next** + **react-i18next**

### Gestion d'état
- **React Context API**
- **Hooks React** : `useState`, `useEffect`, `useMemo`

### Bibliothèques complémentaires
- **Recharts**
- **jsPDF**
- **xlsx**
- **lucide-react**

### Techniques spécifiques
- **HTML5 Drag & Drop API**
- **Mock API services** via `Promise` + `setTimeout`

---

## Architecture du projet frontend

```text
gestioncours-pro/
├── public/                          # Fichiers statiques servis par Vite
│   └── favicon.ico                  # Icône de l'application (optionnelle)
│
├── src/                             # Code source principal du frontend
│   ├── assets/                      # Images, logos, icônes, illustrations
│   │   ├── logo.svg                 # Logo de l'application (optionnel)
│   │   └── illustrations/           # Visuels complémentaires
│   │
│   ├── components/                  # Composants UI réutilisables
│   │   ├── Header.jsx               # Header principal
│   │   ├── Sidebar.jsx              # Navigation latérale
│   │   ├── StatCard.jsx             # Carte statistique
│   │   ├── ChartPlaceholder.jsx     # Placeholder de graphique
│   │   ├── MemberModal.jsx          # Modal membre
│   │   ├── CourseModal.jsx          # Modal cours
│   │   └── PaymentModal.jsx         # Modal paiement
│   │
│   ├── context/                     # Contextes globaux React
│   │   └── AuthContext.jsx          # Authentification simulée + faux JWT
│   │
│   ├── data/                        # Services mockés et données frontend
│   │   ├── mockAuth.js              # Simulation login
│   │   ├── mockMembers.js           # Membres
│   │   ├── mockCourses.js           # Cours / planning
│   │   ├── mockFees.js              # Écolages / paiements
│   │   └── mockAttendanceForum.js   # Présences / forum
│   │
│   ├── hooks/                       # Hooks personnalisés (structure évolutive)
│   ├── layouts/                     # Layouts globaux
│   │   └── AppLayout.jsx            # Header + Sidebar + Outlet
│   │
│   ├── pages/                       # Pages principales routées
│   │   ├── LoginPage.jsx            # Connexion
│   │   ├── DashboardAdminPage.jsx   # Dashboard
│   │   ├── MembersPage.jsx          # Gestion des membres
│   │   ├── CoursesPage.jsx          # Gestion des cours
│   │   ├── FeesPage.jsx             # Gestion des écolages
│   │   ├── AttendancePage.jsx       # Gestion de la présence
│   │   ├── ForumPage.jsx            # Forum de discussion
│   │   └── PlaceholderPage.jsx      # Page temporaire / fallback
│   │
│   ├── routes/                      # Protection et organisation des routes
│   │   └── ProtectedRoute.jsx       # Redirection vers /login si non connecté
│   │
│   ├── utils/                       # Helpers et fonctions utilitaires (structure évolutive)
│   ├── App.jsx                      # Routage principal
│   ├── i18n.js                      # Configuration FR / EN
│   ├── index.css                    # Tailwind + styles globaux
│   └── main.jsx                     # Point d'entrée React
│
├── package.json                     # Dépendances et scripts npm
├── package-lock.json                # Lockfile npm (peut être régénéré via npm install)
├── postcss.config.js                # Configuration PostCSS
├── tailwind.config.js               # Configuration Tailwind CSS
├── vite.config.js                   # Configuration Vite
└── README.md                        # Documentation du projet
```

---

## Comment les appels API ont été mockés

Les appels réseau sont simulés localement dans `src/data/`.

### Principe
Chaque domaine possède son propre fichier de mock :
- `mockAuth.js`
- `mockMembers.js`
- `mockCourses.js`
- `mockFees.js`
- `mockAttendanceForum.js`

### Fonctionnement
Les fonctions mockées :
1. manipulent une **base en mémoire** (tableaux JavaScript)
2. renvoient une **Promise**
3. utilisent `setTimeout()` pour simuler une latence réseau
4. renvoient un objet proche d'une réponse API réelle

### Exemples de routes simulées
- `POST /api/login`
- `GET /api/membres?role=eleve&search=jean`
- `PATCH /api/cours/:id/planning`
- `POST /api/cours`
- `POST /api/ecolage/calcul`
- `POST /api/ecolages/:id/paiement`
- `POST /api/notifications/twilio`
- `PATCH /api/presences/:id`
- `POST /api/forum/posts`
- `POST /api/forum/posts/:id/like`

> Ces routes sont **mockées côté frontend**. Aucun appel HTTP réel n'est encore effectué.

---

## Dépendances principales

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "i18next": "^23.15.2",
    "react-i18next": "^15.0.2",
    "recharts": "^2.12.7",
    "jspdf": "^2.5.2",
    "xlsx": "^0.18.5",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "vite": "^5.4.8",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.13",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20"
  }
}
```

---

## Remarque sur `package-lock.json`

Le `package-lock.json` fourni dans la livraison est une **base initiale cohérente**. Après récupération du projet, il est recommandé d'exécuter :

```bash
npm install
```

Cela permettra à npm de régénérer automatiquement un lockfile complet et parfaitement aligné avec votre environnement local.

---

## Résumé

**GestionCours Pro** fournit une base frontend modulaire, moderne et prête à être connectée à un vrai backend pour gérer :

- la connexion
- les membres
- les cours
- les paiements
- les présences
- le forum

L'architecture a été pensée pour faciliter l'intégration future d'une API réelle sans refonte de l'interface.
