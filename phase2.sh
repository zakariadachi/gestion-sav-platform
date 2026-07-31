#!/bin/bash
# ==============================================================================
# PHASE 2 — June 16 to June 30: Controllers, Auth, Requests, Resources,
#            Policies, Observers, Middleware, Routes, Remaining Migrations
# ==============================================================================

set -e
cd "$(dirname "$0")"

echo "▶ Phase 2 — Controllers, API, Auth, Policies, Observers..."

# ── June 16 (Tuesday) ─────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Http/Controllers/Controller.php
GIT_COMMITTER_DATE="2026-06-16 09:10:00" git commit --date="2026-06-16 09:10:00" -m "chore(backend): add base Controller class"

git add gestion-sav-backend/app/Http/Requests/LoginRequest.php
GIT_COMMITTER_DATE="2026-06-16 10:30:00" git commit --date="2026-06-16 10:30:00" -m "feat(requests): add LoginRequest with email and password validation"

git add gestion-sav-backend/app/Http/Requests/RegisterRequest.php
GIT_COMMITTER_DATE="2026-06-16 14:00:00" git commit --date="2026-06-16 14:00:00" -m "feat(requests): add RegisterRequest with name, email, role validation"

# ── June 17 (Wednesday) ───────────────────────────────────────────────────────

git add gestion-sav-backend/app/Http/Controllers/AuthController.php
GIT_COMMITTER_DATE="2026-06-17 09:20:00" git commit --date="2026-06-17 09:20:00" -m "feat(auth): implement AuthController with register, login and logout"

git add gestion-sav-backend/app/Http/Resources/UserResource.php
GIT_COMMITTER_DATE="2026-06-17 11:45:00" git commit --date="2026-06-17 11:45:00" -m "feat(resources): create UserResource to shape API user responses"

git add gestion-sav-backend/app/Http/Middleware/CheckRole.php
GIT_COMMITTER_DATE="2026-06-17 15:10:00" git commit --date="2026-06-17 15:10:00" -m "feat(middleware): implement CheckRole middleware for RBAC enforcement"

# ── June 18 (Thursday) ────────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/2026_06_18_072730_create_articles_table.php
GIT_COMMITTER_DATE="2026-06-18 09:05:00" git commit --date="2026-06-18 09:05:00" -m "feat(db): create articles table for knowledge base module"

git add gestion-sav-backend/app/Models/Article.php
GIT_COMMITTER_DATE="2026-06-18 11:00:00" git commit --date="2026-06-18 11:00:00" -m "feat(models): create Article model with author relation"

git add gestion-sav-backend/app/Http/Requests/StoreTicketRequest.php
GIT_COMMITTER_DATE="2026-06-18 14:30:00" git commit --date="2026-06-18 14:30:00" -m "feat(requests): add StoreTicketRequest with title, description, priority rules"

# ── June 19 (Friday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Http/Requests/UpdateTicketRequest.php
GIT_COMMITTER_DATE="2026-06-19 09:15:00" git commit --date="2026-06-19 09:15:00" -m "feat(requests): add UpdateTicketRequest with optional field validation"

git add gestion-sav-backend/app/Http/Requests/AssignTechnicienRequest.php
GIT_COMMITTER_DATE="2026-06-19 11:30:00" git commit --date="2026-06-19 11:30:00" -m "feat(requests): add AssignTechnicienRequest to validate technician assignment"

git add gestion-sav-backend/app/Http/Requests/UpdateStatusRequest.php
GIT_COMMITTER_DATE="2026-06-19 14:50:00" git commit --date="2026-06-19 14:50:00" -m "feat(requests): add UpdateStatusRequest with TicketStatus enum validation"

# ── June 22 (Monday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/2026_06_22_012150_add_statut_to_users_table.php
GIT_COMMITTER_DATE="2026-06-22 09:00:00" git commit --date="2026-06-22 09:00:00" -m "feat(db): add statut column to users table for account activation"

git add gestion-sav-backend/app/Http/Controllers/TicketController.php
GIT_COMMITTER_DATE="2026-06-22 10:45:00" git commit --date="2026-06-22 10:45:00" -m "feat(api): implement TicketController with index, show, store, update, destroy"

git add gestion-sav-backend/app/Http/Resources/TicketResource.php
GIT_COMMITTER_DATE="2026-06-22 14:20:00" git commit --date="2026-06-22 14:20:00" -m "feat(resources): create TicketResource with nested client and technician data"

# ── June 23 (Tuesday) ─────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Http/Requests/StoreRapportRequest.php
GIT_COMMITTER_DATE="2026-06-23 09:30:00" git commit --date="2026-06-23 09:30:00" -m "feat(requests): add StoreRapportRequest with contenu and photos validation"

git add gestion-sav-backend/app/Http/Requests/UpdateRapportRequest.php
GIT_COMMITTER_DATE="2026-06-23 11:10:00" git commit --date="2026-06-23 11:10:00" -m "feat(requests): add UpdateRapportRequest for partial rapport updates"

git add gestion-sav-backend/app/Http/Controllers/RapportController.php
GIT_COMMITTER_DATE="2026-06-23 15:00:00" git commit --date="2026-06-23 15:00:00" -m "feat(api): implement RapportController with store, update and show"

# ── June 24 (Wednesday) ───────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/2026_06_24_000001_create_ticket_comments_table.php
GIT_COMMITTER_DATE="2026-06-24 09:10:00" git commit --date="2026-06-24 09:10:00" -m "feat(db): create ticket_comments table for threaded messaging"

git add gestion-sav-backend/app/Models/TicketComment.php
GIT_COMMITTER_DATE="2026-06-24 11:00:00" git commit --date="2026-06-24 11:00:00" -m "feat(models): create TicketComment model with author and ticket relations"

git add gestion-sav-backend/app/Http/Resources/RapportResource.php
GIT_COMMITTER_DATE="2026-06-24 14:40:00" git commit --date="2026-06-24 14:40:00" -m "feat(resources): create RapportResource to format rapport API responses"

# ── June 25 (Thursday) ────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Policies/TicketPolicy.php
GIT_COMMITTER_DATE="2026-06-25 09:20:00" git commit --date="2026-06-25 09:20:00" -m "feat(policies): implement TicketPolicy with role-based view and mutate gates"

git add gestion-sav-backend/app/Policies/RapportPolicy.php
GIT_COMMITTER_DATE="2026-06-25 11:30:00" git commit --date="2026-06-25 11:30:00" -m "feat(policies): implement RapportPolicy restricting writes to technicians"

git add gestion-sav-backend/app/Policies/UserPolicy.php
GIT_COMMITTER_DATE="2026-06-25 14:55:00" git commit --date="2026-06-25 14:55:00" -m "feat(policies): implement UserPolicy restricting user management to Admin"

# ── June 26 (Friday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Policies/ArticlePolicy.php
GIT_COMMITTER_DATE="2026-06-26 09:10:00" git commit --date="2026-06-26 09:10:00" -m "feat(policies): implement ArticlePolicy for knowledge base CRUD gates"

git add gestion-sav-backend/app/Policies/TicketCommentPolicy.php
GIT_COMMITTER_DATE="2026-06-26 11:00:00" git commit --date="2026-06-26 11:00:00" -m "feat(policies): implement TicketCommentPolicy for comment ownership checks"

git add gestion-sav-backend/app/Observers/TicketObserver.php
GIT_COMMITTER_DATE="2026-06-26 14:30:00" git commit --date="2026-06-26 14:30:00" -m "feat(observers): implement TicketObserver for SLA deadline automation"

# ── June 29 (Monday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Http/Requests/StoreCommentRequest.php
GIT_COMMITTER_DATE="2026-06-29 09:05:00" git commit --date="2026-06-29 09:05:00" -m "feat(requests): add StoreCommentRequest with body and attachment validation"

git add gestion-sav-backend/app/Http/Controllers/TicketCommentController.php
GIT_COMMITTER_DATE="2026-06-29 10:50:00" git commit --date="2026-06-29 10:50:00" -m "feat(api): implement TicketCommentController with index, store, update, destroy"

git add gestion-sav-backend/app/Http/Requests/StoreUserRequest.php
GIT_COMMITTER_DATE="2026-06-29 14:10:00" git commit --date="2026-06-29 14:10:00" -m "feat(requests): add StoreUserRequest for Admin user creation"

# ── June 30 (Tuesday) ─────────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/2026_06_30_054402_add_attachment_path_to_ticket_comments_table.php
GIT_COMMITTER_DATE="2026-06-30 09:00:00" git commit --date="2026-06-30 09:00:00" -m "feat(db): add attachment_path column to ticket_comments table"

git add gestion-sav-backend/database/migrations/2026_06_30_060000_add_author_id_to_articles_table.php
GIT_COMMITTER_DATE="2026-06-30 10:15:00" git commit --date="2026-06-30 10:15:00" -m "feat(db): add author_id FK to articles table"

git add gestion-sav-backend/database/migrations/2026_06_30_061214_add_avatar_to_users_table.php
GIT_COMMITTER_DATE="2026-06-30 11:30:00" git commit --date="2026-06-30 11:30:00" -m "feat(db): add avatar column to users table for profile pictures"

git add gestion-sav-backend/app/Http/Requests/UpdateUserRequest.php
GIT_COMMITTER_DATE="2026-06-30 13:45:00" git commit --date="2026-06-30 13:45:00" -m "feat(requests): add UpdateUserRequest for Admin user editing"

git add gestion-sav-backend/app/Http/Controllers/UserController.php
GIT_COMMITTER_DATE="2026-06-30 15:20:00" git commit --date="2026-06-30 15:20:00" -m "feat(api): implement UserController with team, clients and technicians endpoints"

git add gestion-sav-backend/routes/api.php
GIT_COMMITTER_DATE="2026-06-30 17:00:00" git commit --date="2026-06-30 17:00:00" -m "feat(routes): register all API routes with role middleware and throttling"

echo ""
echo "✅ Phase 2 complete — $(git rev-list --count HEAD) commits total on branch $(git branch --show-current)"
echo "👉 Ready for Phase 3?"
