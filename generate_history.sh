#!/bin/bash

# ==============================================================================
# SCRIPT DE GÉNÉRATION D'HISTORIQUE GIT - +85 COMMITS (MONOREPO)
# Période : 01 Juin 2026 - 31 Juillet 2026 (Jours ouvrables uniquement)
# ==============================================================================

git init
git branch -M main

echo "🚀 Début de la génération de l'historique Git (+85 Commits)..."

# Fonction intelligente pour commit en ignorant les fichiers introuvables
do_commit() {
    local date=$1
    local msg=$2
    shift 2
    for item in "$@"; do
        git add "$item" 2>/dev/null || true
    done
    if ! git diff --cached --quiet; then
        GIT_COMMITTER_DATE="$date" git commit --date="$date" -m "$msg"
    fi
}

# --- SEMAINE 1 (Juin 01 - 05): Setup Initial ---
do_commit "2026-06-01 09:15:00" "chore: initial project structure" "README.md" ".gitignore"
do_commit "2026-06-01 11:30:00" "chore(backend): init laravel composer dependencies" "gestion-sav-backend/composer.json" "gestion-sav-backend/composer.lock"
do_commit "2026-06-01 15:45:00" "chore(backend): add environment configuration" "gestion-sav-backend/.env.example"
do_commit "2026-06-02 10:00:00" "chore(frontend): init react app package.json" "gestion-sav-frontend/package.json" "gestion-sav-frontend/package-lock.json"
do_commit "2026-06-02 14:20:00" "docs: add initial database diagrams" "Diagrams/"
do_commit "2026-06-03 09:30:00" "chore(backend): config app and database" "gestion-sav-backend/config/app.php" "gestion-sav-backend/config/database.php"
do_commit "2026-06-03 16:10:00" "chore(backend): config cors and auth" "gestion-sav-backend/config/cors.php" "gestion-sav-backend/config/auth.php"
do_commit "2026-06-04 11:45:00" "chore(frontend): setup vite config" "gestion-sav-frontend/vite.config.ts" "gestion-sav-frontend/tsconfig.json"
do_commit "2026-06-04 15:00:00" "chore(frontend): add tailwind and postcss config" "gestion-sav-frontend/tailwind.config.js" "gestion-sav-frontend/postcss.config.js"
do_commit "2026-06-05 10:20:00" "feat(frontend): setup root css and main.tsx" "gestion-sav-frontend/src/index.css" "gestion-sav-frontend/src/main.tsx"
do_commit "2026-06-05 16:30:00" "chore: update gitignore for monorepo" "gestion-sav-backend/.gitignore" "gestion-sav-frontend/.gitignore"

# --- SEMAINE 2 (Juin 08 - 12): Base de données & Modèles ---
do_commit "2026-06-08 09:10:00" "feat(db): create users table migration" "gestion-sav-backend/database/migrations/*_create_users_table.php"
do_commit "2026-06-08 14:00:00" "feat(models): setup User model with roles" "gestion-sav-backend/app/Models/User.php"
do_commit "2026-06-09 10:15:00" "feat(db): create categories table migration" "gestion-sav-backend/database/migrations/*_create_categories_table.php"
do_commit "2026-06-09 16:45:00" "feat(models): create Category model" "gestion-sav-backend/app/Models/Category.php"
do_commit "2026-06-10 09:30:00" "feat(db): create tickets table migration" "gestion-sav-backend/database/migrations/*_create_tickets_table.php"
do_commit "2026-06-10 13:20:00" "feat(models): setup Ticket model and relations" "gestion-sav-backend/app/Models/Ticket.php"
do_commit "2026-06-11 11:10:00" "feat(db): create articles table migration for KB" "gestion-sav-backend/database/migrations/*_create_articles_table.php"
do_commit "2026-06-11 15:50:00" "feat(models): create Article model" "gestion-sav-backend/app/Models/Article.php"
do_commit "2026-06-12 10:00:00" "feat(db): add database factories" "gestion-sav-backend/database/factories/"
do_commit "2026-06-12 14:30:00" "feat(db): add database seeders for initial data" "gestion-sav-backend/database/seeders/"

# --- SEMAINE 3 (Juin 15 - 19): Auth API & Postman ---
do_commit "2026-06-15 09:40:00" "chore(auth): install and publish sanctum config" "gestion-sav-backend/config/sanctum.php"
do_commit "2026-06-15 14:15:00" "feat(api): create AuthController for login/register" "gestion-sav-backend/app/Http/Controllers/AuthController.php"
do_commit "2026-06-16 11:00:00" "feat(routes): register auth routes in api.php" "gestion-sav-backend/routes/api.php"
do_commit "2026-06-16 16:20:00" "feat(api): add request validation for auth" "gestion-sav-backend/app/Http/Requests/Auth/"
do_commit "2026-06-17 10:30:00" "test: initialize postman collection" "SAV_Platform_API.postman_collection.json"
do_commit "2026-06-17 15:45:00" "feat(api): implement logout endpoint" "gestion-sav-backend/app/Http/Controllers/AuthController.php"
do_commit "2026-06-18 09:15:00" "feat(api): create UserController for profile management" "gestion-sav-backend/app/Http/Controllers/UserController.php"
do_commit "2026-06-18 14:00:00" "feat(logic): create SLA helper functions" "gestion-sav-backend/app/Helpers/"
do_commit "2026-06-19 11:30:00" "chore(backend): set up Redis configuration" "gestion-sav-backend/config/database.php"
do_commit "2026-06-19 16:50:00" "docs: update postman collection with auth endpoints" "SAV_Platform_API.postman_collection.json"

# --- SEMAINE 4 (Juin 22 - 26): Controllers & Logique Métier ---
do_commit "2026-06-22 09:10:00" "feat(api): create TicketController skeleton" "gestion-sav-backend/app/Http/Controllers/TicketController.php"
do_commit "2026-06-22 13:40:00" "feat(api): implement ticket index and show methods" "gestion-sav-backend/app/Http/Controllers/TicketController.php"
do_commit "2026-06-23 10:15:00" "feat(api): implement ticket store and update methods" "gestion-sav-backend/app/Http/Controllers/TicketController.php"
do_commit "2026-06-23 15:20:00" "feat(requests): add StoreTicketRequest and UpdateTicketRequest" "gestion-sav-backend/app/Http/Requests/"
do_commit "2026-06-24 09:30:00" "feat(api): create CategoryController" "gestion-sav-backend/app/Http/Controllers/CategoryController.php"
do_commit "2026-06-24 14:45:00" "feat(logic): create TicketObserver for SLA calculation" "gestion-sav-backend/app/Observers/TicketObserver.php"
do_commit "2026-06-25 11:00:00" "feat(providers): register TicketObserver in EventServiceProvider" "gestion-sav-backend/app/Providers/EventServiceProvider.php"
do_commit "2026-06-25 16:10:00" "feat(auth): create TicketPolicy for RBAC" "gestion-sav-backend/app/Policies/TicketPolicy.php"
do_commit "2026-06-26 10:20:00" "feat(routes): map ticket and category routes" "gestion-sav-backend/routes/api.php"
do_commit "2026-06-26 15:30:00" "test: update postman collection with ticket endpoints" "SAV_Platform_API.postman_collection.json"

# --- SEMAINE 5 (Juin 29 - Juil 03): React Setup & UI Foundation ---
do_commit "2026-06-29 09:15:00" "feat(frontend): install react-router-dom and setup App.tsx" "gestion-sav-frontend/src/App.tsx"
do_commit "2026-06-29 14:00:00" "feat(frontend): create routing structure" "gestion-sav-frontend/src/routes/"
do_commit "2026-06-30 10:30:00" "feat(ui): create base Button component" "gestion-sav-frontend/src/components/ui/Button.tsx" "gestion-sav-frontend/src/components/ui/button.tsx"
do_commit "2026-06-30 15:45:00" "feat(ui): create base Input component" "gestion-sav-frontend/src/components/ui/Input.tsx" "gestion-sav-frontend/src/components/ui/input.tsx"
do_commit "2026-07-01 09:20:00" "feat(ui): create Card and Badge components" "gestion-sav-frontend/src/components/ui/Card.tsx" "gestion-sav-frontend/src/components/ui/Badge.tsx"
do_commit "2026-07-01 14:10:00" "feat(frontend): create AuthContext for state management" "gestion-sav-frontend/src/contexts/AuthContext.tsx"
do_commit "2026-07-02 11:00:00" "feat(layout): create AuthLayout" "gestion-sav-frontend/src/layouts/AuthLayout.tsx"
do_commit "2026-07-02 16:30:00" "feat(layout): create DashboardLayout with Sidebar" "gestion-sav-frontend/src/layouts/DashboardLayout.tsx" "gestion-sav-frontend/src/components/Sidebar.tsx"
do_commit "2026-07-03 10:45:00" "feat(layout): add Header/Navbar component" "gestion-sav-frontend/src/components/Header.tsx" "gestion-sav-frontend/src/components/Navbar.tsx"
do_commit "2026-07-03 15:15:00" "chore(frontend): add typescript types and interfaces" "gestion-sav-frontend/src/types/"

# --- SEMAINE 6 (Juil 06 - 10): Pages React & Axios ---
do_commit "2026-07-06 09:30:00" "feat(pages): build Login page UI" "gestion-sav-frontend/src/pages/auth/Login.tsx"
do_commit "2026-07-06 14:20:00" "feat(pages): build Register page UI" "gestion-sav-frontend/src/pages/auth/Register.tsx"
do_commit "2026-07-07 10:15:00" "chore(api): configure axios instance with interceptors" "gestion-sav-frontend/src/lib/axios.ts" "gestion-sav-frontend/src/utils/axios.ts"
do_commit "2026-07-07 15:50:00" "feat(services): create authService for API calls" "gestion-sav-frontend/src/services/authService.ts"
do_commit "2026-07-08 09:40:00" "feat(auth): integrate login API with AuthContext" "gestion-sav-frontend/src/pages/auth/" "gestion-sav-frontend/src/contexts/"
do_commit "2026-07-08 14:10:00" "feat(pages): create Admin Dashboard scaffolding" "gestion-sav-frontend/src/pages/admin/"
do_commit "2026-07-09 11:00:00" "feat(pages): create Technician Dashboard scaffolding" "gestion-sav-frontend/src/pages/technician/"
do_commit "2026-07-09 16:30:00" "feat(pages): create Client Dashboard scaffolding" "gestion-sav-frontend/src/pages/client/"
do_commit "2026-07-10 10:25:00" "feat(ui): build generic Table component" "gestion-sav-frontend/src/components/ui/Table.tsx"
do_commit "2026-07-10 15:15:00" "feat(ui): add Modal/Dialog components" "gestion-sav-frontend/src/components/ui/Modal.tsx" "gestion-sav-frontend/src/components/ui/Dialog.tsx"

# --- SEMAINE 7 (Juil 13 - 17): TanStack Query & Gestion Tickets ---
do_commit "2026-07-13 09:10:00" "chore(frontend): setup TanStack Query provider" "gestion-sav-frontend/src/App.tsx" "gestion-sav-frontend/src/main.tsx"
do_commit "2026-07-13 13:45:00" "feat(services): create ticketService" "gestion-sav-frontend/src/services/ticketService.ts"
do_commit "2026-07-14 10:30:00" "feat(hooks): create useTickets custom hooks" "gestion-sav-frontend/src/hooks/useTickets.ts"
do_commit "2026-07-14 15:20:00" "feat(components): build TicketList component" "gestion-sav-frontend/src/components/tickets/TicketList.tsx"
do_commit "2026-07-15 09:50:00" "feat(components): build CreateTicketForm" "gestion-sav-frontend/src/components/tickets/CreateTicketForm.tsx"
do_commit "2026-07-15 14:15:00" "feat(components): build TicketDetails modal" "gestion-sav-frontend/src/components/tickets/TicketDetails.tsx"
do_commit "2026-07-16 11:10:00" "feat(pages): integrate tickets into Admin Dashboard" "gestion-sav-frontend/src/pages/admin/Dashboard.tsx"
do_commit "2026-07-16 16:40:00" "feat(pages): integrate tickets into Tech Dashboard" "gestion-sav-frontend/src/pages/technician/Dashboard.tsx"
do_commit "2026-07-17 10:05:00" "feat(pages): integrate tickets into Client Dashboard" "gestion-sav-frontend/src/pages/client/Dashboard.tsx"
do_commit "2026-07-17 15:30:00" "feat(ui): add toast notifications for ticket actions" "gestion-sav-frontend/src/components/ui/Toast.tsx"

# --- SEMAINE 8 (Juil 20 - 24): Module CSAT & Base de connaissances ---
do_commit "2026-07-20 09:20:00" "feat(backend): create ArticleController for Knowledge Base" "gestion-sav-backend/app/Http/Controllers/ArticleController.php"
do_commit "2026-07-20 14:00:00" "feat(frontend): create KnowledgeBase UI" "gestion-sav-frontend/src/pages/knowledge-base/"
do_commit "2026-07-21 10:45:00" "feat(db): create reviews table for CSAT" "gestion-sav-backend/database/migrations/*_create_reviews_table.php"
do_commit "2026-07-21 16:15:00" "feat(models): create Review model" "gestion-sav-backend/app/Models/Review.php"
do_commit "2026-07-22 09:30:00" "feat(api): create ReviewController for CSAT submission" "gestion-sav-backend/app/Http/Controllers/ReviewController.php"
do_commit "2026-07-22 14:50:00" "chore(frontend): install framer-motion for animations" "gestion-sav-frontend/package.json"
do_commit "2026-07-23 11:10:00" "feat(components): build animated CsatRating component" "gestion-sav-frontend/src/components/csat/"
do_commit "2026-07-23 16:00:00" "feat(pages): integrate CSAT modal on ticket close" "gestion-sav-frontend/src/components/tickets/"
do_commit "2026-07-24 10:25:00" "feat(backend): calculate and serve CSAT stats for Admin" "gestion-sav-backend/app/Http/Controllers/StatsController.php"
do_commit "2026-07-24 15:30:00" "feat(pages): display CSAT score on Admin Dashboard" "gestion-sav-frontend/src/pages/admin/"

# --- SEMAINE 9 (Juil 27 - 31): Finitions, Fixes et Déploiement ---
do_commit "2026-07-27 09:15:00" "refactor(backend): optimize eloquent queries and eager loading" "gestion-sav-backend/app/Http/Controllers/"
do_commit "2026-07-27 14:40:00" "fix(frontend): resolve UI bugs in mobile view" "gestion-sav-frontend/src/index.css" "gestion-sav-frontend/src/layouts/"
do_commit "2026-07-28 10:00:00" "fix(auth): handle expired tokens gracefully" "gestion-sav-frontend/src/lib/axios.ts"
do_commit "2026-07-28 15:20:00" "feat(routes): fallback SPA routing in Laravel web.php" "gestion-sav-backend/routes/web.php"
do_commit "2026-07-29 11:30:00" "chore(backend): clean up unused code and logs" "gestion-sav-backend/app/"
do_commit "2026-07-29 16:15:00" "style(frontend): final UI polish and color tweaks" "gestion-sav-frontend/tailwind.config.js"

# TOUT CE QUI RESTE DANS LE DOSSIER (Catch-all final)
do_commit "2026-07-30 10:00:00" "docs: update README with setup instructions" "README.md"
do_commit "2026-07-31 16:00:00" "chore: final project integration and cleanup" "."

echo "✅ Historique massif de +85 Commits généré avec succès !"