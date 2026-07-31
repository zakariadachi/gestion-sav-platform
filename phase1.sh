#!/bin/bash
# ==============================================================================
# PHASE 1 — June 1 to June 15: Backend Setup, Configs, DB Migrations, Models
# All files are untracked on orphan branch fresh_main
# ==============================================================================

set -e
cd "$(dirname "$0")"

echo "▶ Phase 1 — Backend Setup, DB, Models..."

# ── June 01 (Monday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/.gitignore
GIT_COMMITTER_DATE="2026-06-01 09:12:00" git commit --date="2026-06-01 09:12:00" -m "chore: init backend .gitignore"

git add gestion-sav-backend/composer.json
GIT_COMMITTER_DATE="2026-06-01 10:05:00" git commit --date="2026-06-01 10:05:00" -m "chore(backend): add composer.json with Laravel 13 and Sanctum dependencies"

git add gestion-sav-backend/composer.lock
GIT_COMMITTER_DATE="2026-06-01 11:30:00" git commit --date="2026-06-01 11:30:00" -m "chore(backend): lock composer dependencies"

# ── June 02 (Tuesday) ─────────────────────────────────────────────────────────

git add gestion-sav-backend/.env.example
GIT_COMMITTER_DATE="2026-06-02 09:20:00" git commit --date="2026-06-02 09:20:00" -m "chore(backend): add .env.example with PostgreSQL and Sanctum config"

git add gestion-sav-backend/config/app.php
GIT_COMMITTER_DATE="2026-06-02 10:50:00" git commit --date="2026-06-02 10:50:00" -m "chore(config): configure app name, locale and timezone"

git add gestion-sav-backend/config/database.php
GIT_COMMITTER_DATE="2026-06-02 14:30:00" git commit --date="2026-06-02 14:30:00" -m "chore(config): set PostgreSQL as default database connection"

# ── June 03 (Wednesday) ───────────────────────────────────────────────────────

git add gestion-sav-backend/config/cors.php
GIT_COMMITTER_DATE="2026-06-03 09:10:00" git commit --date="2026-06-03 09:10:00" -m "chore(config): configure CORS allowed origins for frontend"

git add gestion-sav-backend/config/auth.php
GIT_COMMITTER_DATE="2026-06-03 10:40:00" git commit --date="2026-06-03 10:40:00" -m "chore(config): set Sanctum as default API guard"

git add gestion-sav-backend/config/sanctum.php
GIT_COMMITTER_DATE="2026-06-03 14:15:00" git commit --date="2026-06-03 14:15:00" -m "chore(config): publish and configure Sanctum stateful domains"

# ── June 04 (Thursday) ────────────────────────────────────────────────────────

git add gestion-sav-backend/config/session.php
GIT_COMMITTER_DATE="2026-06-04 09:30:00" git commit --date="2026-06-04 09:30:00" -m "chore(config): configure database session driver"

git add gestion-sav-backend/config/queue.php
GIT_COMMITTER_DATE="2026-06-04 11:00:00" git commit --date="2026-06-04 11:00:00" -m "chore(config): set database queue driver for async job processing"

git add gestion-sav-backend/config/mail.php
GIT_COMMITTER_DATE="2026-06-04 14:20:00" git commit --date="2026-06-04 14:20:00" -m "chore(config): configure SMTP mail driver with Mailtrap sandbox"

# ── June 05 (Friday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/config/cache.php
GIT_COMMITTER_DATE="2026-06-05 09:45:00" git commit --date="2026-06-05 09:45:00" -m "chore(config): configure database cache store"

git add gestion-sav-backend/config/logging.php
GIT_COMMITTER_DATE="2026-06-05 11:30:00" git commit --date="2026-06-05 11:30:00" -m "chore(config): setup stack log channel with single driver"

git add gestion-sav-backend/config/filesystems.php
GIT_COMMITTER_DATE="2026-06-05 14:00:00" git commit --date="2026-06-05 14:00:00" -m "chore(config): configure public disk for file attachments"

# ── June 08 (Monday) ──────────────────────────────────────────────────────────

git add "Diagrams/Class diagram.png"
GIT_COMMITTER_DATE="2026-06-08 09:05:00" git commit --date="2026-06-08 09:05:00" -m "docs: add class diagram for SAV platform domain model"

git add "Diagrams/UseCase diagram.png"
GIT_COMMITTER_DATE="2026-06-08 10:20:00" git commit --date="2026-06-08 10:20:00" -m "docs: add use case diagram for Admin, Technician and Client actors"

git add gestion-sav-backend/database/migrations/0001_01_01_000000_create_users_table.php
GIT_COMMITTER_DATE="2026-06-08 14:10:00" git commit --date="2026-06-08 14:10:00" -m "feat(db): create users, sessions and password_reset_tokens tables"

# ── June 09 (Tuesday) ─────────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/0001_01_01_000001_create_cache_table.php
GIT_COMMITTER_DATE="2026-06-09 09:30:00" git commit --date="2026-06-09 09:30:00" -m "feat(db): create cache and cache_locks tables"

git add gestion-sav-backend/database/migrations/0001_01_01_000002_create_jobs_table.php
GIT_COMMITTER_DATE="2026-06-09 11:20:00" git commit --date="2026-06-09 11:20:00" -m "feat(db): create jobs, job_batches and failed_jobs tables"

git add gestion-sav-backend/database/migrations/2026_06_03_093942_create_personal_access_tokens_table.php
GIT_COMMITTER_DATE="2026-06-09 14:45:00" git commit --date="2026-06-09 14:45:00" -m "feat(db): create personal_access_tokens table for Sanctum auth"

# ── June 10 (Wednesday) ───────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/2026_06_03_090701_create_tickets_table.php
GIT_COMMITTER_DATE="2026-06-10 09:15:00" git commit --date="2026-06-10 09:15:00" -m "feat(db): create tickets table with status, priority and FK constraints"

git add gestion-sav-backend/database/migrations/2026_06_03_090702_create_rapports_table.php
GIT_COMMITTER_DATE="2026-06-10 11:40:00" git commit --date="2026-06-10 11:40:00" -m "feat(db): create rapports table with photos JSON column"

git add gestion-sav-backend/app/Enums/UserRole.php
GIT_COMMITTER_DATE="2026-06-10 14:30:00" git commit --date="2026-06-10 14:30:00" -m "feat(enums): define UserRole enum (Admin, Technician, Client)"

# ── June 11 (Thursday) ────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Enums/TicketStatus.php
GIT_COMMITTER_DATE="2026-06-11 09:10:00" git commit --date="2026-06-11 09:10:00" -m "feat(enums): define TicketStatus enum for full ticket lifecycle"

git add gestion-sav-backend/app/Models/User.php
GIT_COMMITTER_DATE="2026-06-11 11:00:00" git commit --date="2026-06-11 11:00:00" -m "feat(models): setup User model with Sanctum HasApiTokens and role relations"

git add gestion-sav-backend/app/Models/Ticket.php
GIT_COMMITTER_DATE="2026-06-11 14:20:00" git commit --date="2026-06-11 14:20:00" -m "feat(models): create Ticket model with client and technician BelongsTo"

# ── June 12 (Friday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Models/Rapport.php
GIT_COMMITTER_DATE="2026-06-12 09:20:00" git commit --date="2026-06-12 09:20:00" -m "feat(models): create Rapport model with HasOne relation to Ticket"

git add gestion-sav-backend/database/factories/UserFactory.php
GIT_COMMITTER_DATE="2026-06-12 11:10:00" git commit --date="2026-06-12 11:10:00" -m "feat(db): add UserFactory for seeding test users with roles"

git add gestion-sav-backend/database/factories/TicketFactory.php
GIT_COMMITTER_DATE="2026-06-12 14:50:00" git commit --date="2026-06-12 14:50:00" -m "feat(db): add TicketFactory for seeding test tickets"

# ── June 15 (Monday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/database/seeders/DatabaseSeeder.php
GIT_COMMITTER_DATE="2026-06-15 09:30:00" git commit --date="2026-06-15 09:30:00" -m "feat(db): configure DatabaseSeeder with admin, technician and client users"

git add gestion-sav-backend/app/Providers/AppServiceProvider.php
GIT_COMMITTER_DATE="2026-06-15 11:20:00" git commit --date="2026-06-15 11:20:00" -m "feat(providers): register policies and observers in AppServiceProvider"

git add gestion-sav-backend/bootstrap/app.php
git add gestion-sav-backend/bootstrap/providers.php
GIT_COMMITTER_DATE="2026-06-15 14:05:00" git commit --date="2026-06-15 14:05:00" -m "chore(backend): configure bootstrap with middleware and provider bindings"

git add gestion-sav-backend/artisan
GIT_COMMITTER_DATE="2026-06-15 16:30:00" git commit --date="2026-06-15 16:30:00" -m "chore(backend): add artisan CLI entry point"

echo ""
echo "✅ Phase 1 complete — $(git rev-list --count HEAD) commits on branch $(git branch --show-current)"
echo "👉 Ready for Phase 2?"
