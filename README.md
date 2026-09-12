# Gestion SAV — Plateforme de Service Après-Vente

Plateforme web complète de gestion de tickets d'intervention technique.  
Elle couvre le cycle entier d'une demande SAV : soumission par le client → assignation par l'admin → résolution par le technicien → rapport + notation.

---

## Table des matières

1. [Aperçu](#1-aperçu)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Prérequis](#4-prérequis)
5. [Installation — Développement local](#5-installation--développement-local)
6. [Variables d'environnement](#6-variables-denvironnement)
7. [Lancer le projet](#7-lancer-le-projet)
8. [Rôles et accès](#8-rôles-et-accès)
9. [Fonctionnalités principales](#9-fonctionnalités-principales)
10. [API — Référence des endpoints](#10-api--référence-des-endpoints)
11. [Schéma de base de données](#11-schéma-de-base-de-données)
12. [Temps réel (WebSocket)](#12-temps-réel-websocket)
13. [Emails transactionnels](#13-emails-transactionnels)
14. [Sécurité](#14-sécurité)
15. [Tests](#15-tests)
16. [Déploiement en production](#16-déploiement-en-production)
17. [Collection Postman](#17-collection-postman)

---

## 1. Aperçu

| Rôle | Accès principal |
|---|---|
| **Admin** | Tableau de bord, gestion équipe/clients, assignation tickets, base de connaissances |
| **Technicien** | Tickets assignés, mise à jour statut, rapport d'intervention |
| **Client** | Soumission tickets, suivi temps réel, base de connaissances, rapports personnels |

---

## 2. Stack technique

### Backend
| Technologie | Version | Usage |
|---|---|---|
| PHP | 8.3+ | Langage serveur |
| Laravel | 13.x | Framework API REST |
| Laravel Sanctum | 4.x | Authentification SPA (sessions cookie) |
| Laravel Reverb | 1.x | Serveur WebSocket temps réel |
| PostgreSQL | 14+ | Base de données principale |
| Laravel Queue | — | Traitement asynchrone (emails) |

### Frontend
| Technologie | Version | Usage |
|---|---|---|
| React | 19.x | Interface utilisateur |
| Vite | 8.x | Bundler |
| TypeScript | 7.x | Typage statique (pages critiques) |
| Tailwind CSS | 4.x | Styles utilitaires |
| Framer Motion | 12.x | Animations |
| TanStack React Query | 5.x | Cache et synchronisation serveur |
| Axios | 1.x | Client HTTP |
| Laravel Echo + Pusher JS | 2.x / 8.x | Client WebSocket |
| React Router DOM | 7.x | Routage SPA |

---

## 3. Architecture du projet

```
SAV-Stage/
├── gestion-sav-backend/        # API Laravel
│   ├── app/
│   │   ├── Enums/              # UserRole, TicketStatus
│   │   ├── Events/             # TicketCommentCreated (broadcast)
│   │   ├── Http/
│   │   │   ├── Controllers/    # Un contrôleur par ressource
│   │   │   ├── Middleware/     # CheckRole, SecurityHeaders
│   │   │   ├── Requests/       # FormRequests (validation + autorisation)
│   │   │   └── Resources/      # API Resources (UserResource, TicketResource…)
│   │   ├── Mail/               # WelcomeMail, TicketAssigned, TicketStatusUpdated
│   │   ├── Models/             # User, Ticket, Rapport, TicketComment, Article
│   │   ├── Observers/          # TicketObserver (cache + emails)
│   │   ├── Policies/           # TicketPolicy, UserPolicy, ArticlePolicy
│   │   ├── Providers/          # AppServiceProvider (policies + rate limiters)
│   │   ├── Repositories/       # TicketRepository
│   │   └── Services/           # TicketService, DashboardService, AttachmentService
│   ├── database/
│   │   ├── migrations/         # 21 migrations ordonnées
│   │   └── seeders/            # DatabaseSeeder (admin + techniciens + clients + tickets)
│   └── routes/
│       ├── api.php             # Toutes les routes API
│       └── channels.php        # Autorisation canaux WebSocket
│
├── gestion-sav-frontend/       # SPA React
│   └── src/
│       ├── components/         # Composants réutilisables + layouts
│       ├── constants/          # Enums JS (ROLES, TICKET_STATUS, PRIORITIES)
│       ├── context/            # AuthContext
│       ├── hooks/              # useTickets
│       ├── pages/              # Une page par route
│       └── services/           # api.js (Axios), echo.js (WebSocket)
│
├── Diagrams/                   # Diagrammes UML (classes, cas d'utilisation)
└── SAV_Platform_API.postman_collection.json
```

### Pattern architectural backend
```
Route → Middleware (auth, role, throttle)
      → FormRequest (validation + autorisation fast-fail)
      → Controller
      → Gate::authorize() (Policy — source de vérité)
      → Service / Repository
      → Model / Eloquent
      → PostgreSQL
```

---

## 4. Prérequis

- **PHP** 8.3+ avec extensions : `pdo_pgsql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`
- **Composer** 2.x
- **Node.js** 20+ et **npm** 10+
- **PostgreSQL** 14+
- **Git**

---

## 5. Installation — Développement local

### 5.1 Cloner le dépôt

```bash
git clone <url-du-repo> SAV-Stage
cd SAV-Stage
```

### 5.2 Backend

```bash
cd gestion-sav-backend

# Installer les dépendances PHP
composer install

# Copier et configurer l'environnement
cp .env.example .env

# Éditer .env : renseigner DB_*, MAIL_*, REVERB_*, FRONTEND_URL
# Voir section "Variables d'environnement" ci-dessous

# Générer la clé d'application
php artisan key:generate

# Créer la base de données PostgreSQL puis lancer les migrations
php artisan migrate

# (Optionnel) Peupler avec des données de test
php artisan db:seed

# Créer le lien symbolique pour le stockage public
php artisan storage:link
```

### 5.3 Frontend

```bash
cd ../gestion-sav-frontend

# Installer les dépendances JS
npm install

# Copier et configurer l'environnement
cp .env.example .env   # ou créer .env manuellement (voir section ci-dessous)
```

---

## 6. Variables d'environnement

### Backend — `gestion-sav-backend/.env`

```env
APP_NAME="Gestion SAV"
APP_ENV=local
APP_KEY=                          # généré par php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Base de données PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=interventions_db
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe

# Sessions
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Broadcasting — DOIT être "reverb" pour que le temps réel fonctionne
BROADCAST_CONNECTION=reverb
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
CACHE_STORE=database

# Mail (Mailtrap pour le dev)
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username_mailtrap
MAIL_PASSWORD=votre_password_mailtrap
MAIL_FROM_ADDRESS="support@votre-domaine.com"
MAIL_FROM_NAME="Gestion SAV"

# Sanctum — domaines autorisés pour les sessions SPA
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost,127.0.0.1

# Reverb WebSocket
REVERB_APP_ID=votre_app_id
REVERB_APP_KEY=votre_app_key        # DOIT correspondre à VITE_REVERB_APP_KEY
REVERB_APP_SECRET=votre_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Ces variables sont transmises automatiquement au frontend via Vite
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Frontend — `gestion-sav-frontend/.env`

```env
# URL de l'API backend
VITE_API_URL=http://localhost:8000/api

# Reverb WebSocket — DOIT correspondre à REVERB_APP_KEY dans le backend
VITE_REVERB_APP_KEY=votre_app_key   # même valeur que le backend
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

> **Important :** `VITE_REVERB_APP_KEY` dans le frontend doit être identique à `REVERB_APP_KEY` dans le backend. Une divergence casse entièrement le temps réel.

---

## 7. Lancer le projet

Ouvrir **4 terminaux** depuis `gestion-sav-backend/` :

```bash
# Terminal 1 — Serveur Laravel
php artisan serve

# Terminal 2 — Serveur WebSocket Reverb
php artisan reverb:start

# Terminal 3 — Worker de queue (emails asynchrones)
php artisan queue:listen

# Terminal 4 — Frontend Vite (depuis gestion-sav-frontend/)
cd ../gestion-sav-frontend && npm run dev
```

Ou utiliser le script tout-en-un depuis `gestion-sav-backend/` :

```bash
composer run dev
```

L'application est accessible sur **http://localhost:5173**

### Comptes de test (après `db:seed`)

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@sav.com` | `password` | Admin |
| *(générés par factory)* | `password` | Technicien × 3 |
| *(générés par factory)* | `password` | Client × 10 |

---

## 8. Rôles et accès

```
Admin
 ├── Tableau de bord statistique        /dashboard
 ├── Gestion de l'équipe                /equipe
 ├── Gestion des clients                /clients
 ├── Gestion base de connaissances      /knowledge-base
 ├── Liste de tous les tickets          /tickets
 └── Profil                             /profile

Technicien
 ├── Tableau de bord technicien         /technicien
 ├── Tickets assignés                   /tickets
 └── Profil                             /profile

Client
 ├── Tableau de bord client             /client
 ├── Détail d'un ticket                 /client/ticket/:id
 ├── Base de connaissances              /client/knowledge-base
 ├── Rapports personnels                /client/reports
 └── Profil                             /profile
```

---

## 9. Fonctionnalités principales

### Gestion des tickets
- Création par le client avec titre, description et priorité (`Low` / `Medium` / `High` / `Critical`)
- Identifiants ULID (non séquentiels, non prédictibles)
- Statuts : `New` → `In_Progress` → `Resolved`
- Filtres : statut, priorité, recherche textuelle (titre, nom client/technicien, ID)
- Pagination (15 par page)
- Date d'échéance configurable par l'admin
- Soft delete (suppression douce)

### Rapport d'intervention
- Un seul rapport par ticket (contrainte UNIQUE en base)
- Création atomique : rapport + passage à `Resolved` dans une seule transaction
- Support de photos (jpeg, png, jpg, webp — max 2 Mo chacune)
- Protection contre les soumissions concurrentes

### Messagerie temps réel
- Chat intégré dans la page de détail du ticket
- Diffusion via WebSocket (Laravel Reverb, canal privé `ticket.{id}`)
- Support de pièces jointes (jpeg, png, jpg, pdf — max 5 Mo)
- Déduplication des messages côté frontend

### Satisfaction client (CSAT)
- Note de 1 à 5 étoiles après résolution
- Commentaire libre optionnel

### Base de connaissances
- Articles organisés par catégories avec icônes
- Lecture pour tous les utilisateurs authentifiés
- CRUD complet réservé à l'admin

### Notifications
- In-app (base de données) avec marquage lu/non lu
- Email asynchrone : bienvenue, assignation ticket, résolution ticket

### Tableau de bord admin
- Statistiques globales mises en cache 5 minutes
- Performance par technicien
- Invalidation automatique du cache à chaque modification de ticket

---

## 10. API — Référence des endpoints

### Authentification (public)

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Inscription client |
| `POST` | `/api/login` | Connexion |
| `POST` | `/api/forgot-password` | Demande de réinitialisation |
| `POST` | `/api/reset-password` | Réinitialisation du mot de passe |

### Authentification (protégé)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user` | Utilisateur connecté |
| `POST` | `/api/logout` | Déconnexion |
| `GET` | `/api/email/verify/{id}/{hash}` | Vérification email |
| `POST` | `/api/email/verification-notification` | Renvoi email de vérification |

### Tickets

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| `GET` | `/api/tickets` | Tous | Liste (filtrée par rôle) |
| `GET` | `/api/tickets/{id}` | Tous | Détail |
| `POST` | `/api/tickets` | Client | Créer |
| `PUT` | `/api/tickets/{id}` | Client | Modifier |
| `POST` | `/api/tickets/{id}/reopen` | Client | Rouvrir |
| `POST` | `/api/tickets/{id}/rate` | Client | Noter (CSAT) |
| `PATCH` | `/api/tickets/{id}/assign` | Admin | Assigner technicien |
| `DELETE` | `/api/tickets/{id}` | Admin | Supprimer |
| `PATCH` | `/api/tickets/{id}/status` | Technicien | Changer statut |

### Rapports

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| `POST` | `/api/tickets/{id}/rapport` | Admin, Technicien | Créer rapport |
| `PUT` | `/api/tickets/{id}/rapport` | Admin, Technicien | Modifier rapport |
| `GET` | `/api/tickets/{id}/rapport` | Tous (autorisés) | Consulter rapport |

### Commentaires

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets/{id}/comments` | Liste des commentaires |
| `POST` | `/api/tickets/{id}/comments` | Envoyer un commentaire |
| `PUT` | `/api/tickets/{id}/comments/{cid}` | Modifier un commentaire |
| `DELETE` | `/api/tickets/{id}/comments/{cid}` | Supprimer un commentaire |

### Utilisateurs (Admin)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/team` | Liste équipe (admins + techniciens) |
| `GET` | `/api/users/clients` | Liste clients |
| `GET` | `/api/technicians` | Liste techniciens (pour assignation) |
| `POST` | `/api/users` | Créer utilisateur |
| `PUT` | `/api/users/{id}` | Modifier utilisateur |
| `DELETE` | `/api/users/{id}` | Supprimer utilisateur |

### Autres

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| `POST` | `/api/profile` | Tous | Mettre à jour le profil |
| `GET` | `/api/dashboard/stats` | Admin | Statistiques tableau de bord |
| `GET` | `/api/client/reports` | Client | Rapports personnels |
| `GET` | `/api/articles` | Tous | Liste articles |
| `GET` | `/api/articles/{id}` | Tous | Détail article |
| `POST` | `/api/articles` | Admin | Créer article |
| `PUT` | `/api/articles/{id}` | Admin | Modifier article |
| `DELETE` | `/api/articles/{id}` | Admin | Supprimer article |
| `GET` | `/api/notifications` | Tous | Liste notifications |
| `PATCH` | `/api/notifications/{id}/read` | Tous | Marquer comme lue |
| `POST` | `/api/notifications/mark-all-read` | Tous | Tout marquer comme lu |

---

## 11. Schéma de base de données

```
users
 ├── id (bigint, PK)
 ├── name, email (unique), password
 ├── role: Admin | Technician | Client
 ├── status: Active | Inactive
 ├── phone, company, avatar
 └── deleted_at (soft delete)

tickets
 ├── id (ULID, PK)
 ├── client_id → users
 ├── technician_id → users (nullable)
 ├── title, description
 ├── status: New | In_Progress | Resolved
 ├── priority: Low | Medium | High | Critical
 ├── due_date (nullable)
 ├── rating (1-5, nullable), feedback (nullable)
 └── deleted_at (soft delete)
 └── indexes: status, priority, client_id, technician_id

rapports
 ├── id (bigint, PK)
 ├── ticket_id → tickets (UNIQUE — un rapport par ticket)
 ├── contenu (text)
 └── photos (json, nullable)

ticket_comments
 ├── id (bigint, PK)
 ├── ticket_id → tickets
 ├── user_id → users
 ├── message (text)
 └── attachment_path (nullable)

articles
 ├── id (bigint, PK)
 ├── author_id → users (nullable)
 ├── title, category, desc, content, icon
 └── views

notifications
 ├── id (uuid, PK)
 ├── type, data
 ├── notifiable_type + notifiable_id (polymorphique)
 └── read_at (nullable)
```

---

## 12. Temps réel (WebSocket)

Le temps réel est géré par **Laravel Reverb** (serveur WebSocket) et **Laravel Echo** (client).

### Canal privé ticket

```
Canal  : ticket.{ticketId}
Événement : TicketCommentCreated
Autorisation : TicketPolicy::view (client propriétaire, technicien assigné, admin)
```

### Flux complet

```
Client envoie un message
  → POST /api/tickets/{id}/comments
  → TicketCommentController::store()
  → broadcast(new TicketCommentCreated($comment))
  → Reverb diffuse sur le canal privé ticket.{id}
  → Laravel Echo reçoit l'événement côté frontend
  → Le message apparaît en temps réel dans le chat
```

### Vérification de la connexion

Ouvrir les DevTools du navigateur → onglet **Network** → filtre **WS**.  
Une connexion WebSocket active doit apparaître vers `ws://localhost:8080`.

---

## 13. Emails transactionnels

Tous les emails sont envoyés de manière **asynchrone** via la file d'attente.  
Le worker de queue doit être actif : `php artisan queue:listen`

| Email | Destinataire | Déclencheur |
|---|---|---|
| Bienvenue + mot de passe temporaire | Nouvel utilisateur (créé par admin) | `UserController::store()` |
| Ticket assigné | Technicien | `TicketObserver::updated()` — changement de `technician_id` |
| Ticket résolu | Client | `TicketObserver::updated()` — passage à `Resolved` |

En développement, les emails sont capturés par **Mailtrap** (configurer `MAIL_*` dans `.env`).

---

## 14. Sécurité

### Authentification
- Sessions cookie **httpOnly** via Sanctum — aucun token JWT stocké en localStorage
- CSRF : cookie `XSRF-TOKEN` + header `X-XSRF-TOKEN` sur toutes les requêtes mutantes
- Régénération de session à la connexion et à la déconnexion
- Vérification d'email obligatoire avant accès aux fonctionnalités

### Autorisation
- **Policies** Laravel (`TicketPolicy`, `UserPolicy`, `ArticlePolicy`)
- Double vérification : `FormRequest::authorize()` (fast-fail) + `Gate::authorize()` (source de vérité)
- Middleware `role` pour le contrôle d'accès au niveau des routes
- Portée des données par rôle : un client ne voit jamais les tickets d'un autre

### Protection des données
- `client_id` et `technician_id` exclus du `$fillable` — jamais assignables par mass assignment
- Identifiants de tickets en **ULID** (non séquentiels, non prédictibles)
- Soft delete sur utilisateurs et tickets

### En-têtes HTTP
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`
- `Strict-Transport-Security` (production uniquement)

### Rate Limiting

| Limiteur | Limite |
|---|---|
| API globale | 60 req/min par utilisateur/IP |
| Connexion | 5 req/min par email+IP |
| Inscription | 3 req/heure par IP |
| Création ticket / profil | 5 req/min par utilisateur |
| Mot de passe oublié | 3 req/min par IP |
| Réinitialisation | 3 req/min par IP |

---

## 15. Tests

```bash
cd gestion-sav-backend

# Lancer tous les tests
php artisan test

# Ou via composer
composer run test
```

> La suite de tests actuelle contient les tests de scaffolding Laravel.  
> Des tests fonctionnels (authentification, autorisation, workflow tickets) sont à ajouter.

---

## 16. Déploiement en production

### Prérequis serveur
- PHP 8.3+ (PHP-FPM)
- Nginx ou Apache
- PostgreSQL 14+
- Supervisor (pour les processus persistants)
- Certificat SSL (HTTPS obligatoire)

### Variables d'environnement production

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com
FRONTEND_URL=https://votre-frontend.com

BROADCAST_CONNECTION=reverb
REVERB_SCHEME=https

SESSION_ENCRYPT=true
LOG_LEVEL=error
LOG_STACK=daily
```

### Script de déploiement

```bash
chmod +x deploy.sh
./deploy.sh
```

Le script effectue dans l'ordre :
1. Mode maintenance (`php artisan down`)
2. Installation des dépendances sans dev (`--no-dev --optimize-autoloader`)
3. Nettoyage des anciens caches
4. Mise en cache : config, events, routes, vues
5. Migrations (`--force`)
6. Redémarrage des workers (`queue:restart`)
7. Remise en ligne (`php artisan up`)

### Configuration Supervisor (workers persistants)

```ini
[program:sav-queue]
command=php /var/www/sav/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true

[program:sav-reverb]
command=php /var/www/sav/artisan reverb:start
autostart=true
autorestart=true
```

### Build frontend

```bash
cd gestion-sav-frontend
npm run build
# Les fichiers compilés sont dans dist/ — à servir via Nginx
```

---

## 17. Collection Postman

Une collection Postman complète est disponible à la racine du projet :

```
SAV_Platform_API.postman_collection.json
```

Elle contient tous les endpoints documentés avec des exemples de requêtes et de réponses.

**Import :** Postman → Import → sélectionner le fichier `.json`

---

## Structure des répertoires (résumé)

```
SAV-Stage/
├── gestion-sav-backend/    # API Laravel 13
├── gestion-sav-frontend/   # SPA React 19
├── Diagrams/               # Diagrammes UML
└── SAV_Platform_API.postman_collection.json
```

---

## Licence

Projet de stage — usage interne.
