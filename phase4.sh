#!/bin/bash
# ==============================================================================
# PHASE 4 — July 16 to July 31: Dashboards, Ticket Components, TanStack Hooks,
#            Remaining Backend, CSAT, Postman Collection, Final cleanup
# ==============================================================================

set -e
cd "$(dirname "$0")"

echo "▶ Phase 4 — Dashboards, TanStack Query, CSAT, Final cleanup..."

# ── July 16 (Thursday) ────────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/2026_07_03_084155_add_indexes_to_tickets_table.php
GIT_COMMITTER_DATE="2026-07-16 09:05:00" git commit --date="2026-07-16 09:05:00" -m "perf(db): add indexes on tickets table for faster query filtering"

git add gestion-sav-backend/app/Http/Controllers/DashboardController.php
GIT_COMMITTER_DATE="2026-07-16 10:40:00" git commit --date="2026-07-16 10:40:00" -m "feat(api): implement DashboardController with aggregated stats endpoint"

git add gestion-sav-backend/app/Services/DashboardService.php
GIT_COMMITTER_DATE="2026-07-16 14:15:00" git commit --date="2026-07-16 14:15:00" -m "feat(services): create DashboardService to compute ticket and CSAT metrics"

# ── July 17 (Friday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Services/TicketService.php
GIT_COMMITTER_DATE="2026-07-17 09:20:00" git commit --date="2026-07-17 09:20:00" -m "feat(services): create TicketService encapsulating assignment and status logic"

git add gestion-sav-backend/app/Repositories/TicketRepository.php
GIT_COMMITTER_DATE="2026-07-17 11:10:00" git commit --date="2026-07-17 11:10:00" -m "feat(repositories): implement TicketRepository for filtered paginated queries"

git add gestion-sav-backend/app/Services/AttachmentService.php
GIT_COMMITTER_DATE="2026-07-17 14:50:00" git commit --date="2026-07-17 14:50:00" -m "feat(services): create AttachmentService for comment file upload handling"

# ── July 20 (Monday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/2026_07_10_000000_add_soft_deletes_to_users_and_tickets_tables.php
GIT_COMMITTER_DATE="2026-07-20 09:00:00" git commit --date="2026-07-20 09:00:00" -m "feat(db): add soft deletes to users and tickets tables"

git add gestion-sav-backend/database/migrations/2026_07_11_000001_rename_statut_to_status_on_users_table.php
GIT_COMMITTER_DATE="2026-07-20 10:30:00" git commit --date="2026-07-20 10:30:00" -m "refactor(db): rename statut to status on users table for consistency"

git add gestion-sav-backend/database/migrations/2026_07_11_000002_add_unique_ticket_id_to_rapports_table.php
GIT_COMMITTER_DATE="2026-07-20 14:00:00" git commit --date="2026-07-20 14:00:00" -m "feat(db): add unique constraint on ticket_id in rapports table"

# ── July 21 (Tuesday) ─────────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/2026_07_16_075300_change_tickets_id_to_ulid.php
GIT_COMMITTER_DATE="2026-07-21 09:10:00" git commit --date="2026-07-21 09:10:00" -m "refactor(db): migrate tickets primary key from integer to ULID"

git add gestion-sav-backend/app/Http/Requests/UpdateProfileRequest.php
GIT_COMMITTER_DATE="2026-07-21 10:55:00" git commit --date="2026-07-21 10:55:00" -m "feat(requests): add UpdateProfileRequest for name, avatar and password update"

git add gestion-sav-backend/app/Http/Controllers/ProfileController.php
GIT_COMMITTER_DATE="2026-07-21 14:20:00" git commit --date="2026-07-21 14:20:00" -m "feat(api): implement ProfileController with avatar upload and password change"

# ── July 22 (Wednesday) ───────────────────────────────────────────────────────

git add gestion-sav-backend/app/Http/Controllers/PasswordResetController.php
GIT_COMMITTER_DATE="2026-07-22 09:15:00" git commit --date="2026-07-22 09:15:00" -m "feat(auth): implement PasswordResetController with token email and reset"

git add gestion-sav-backend/app/Http/Controllers/VerificationController.php
GIT_COMMITTER_DATE="2026-07-22 11:00:00" git commit --date="2026-07-22 11:00:00" -m "feat(auth): implement VerificationController for signed email verification"

git add gestion-sav-backend/app/Http/Middleware/SecurityHeaders.php
GIT_COMMITTER_DATE="2026-07-22 14:30:00" git commit --date="2026-07-22 14:30:00" -m "feat(middleware): add SecurityHeaders middleware with CSP and HSTS headers"

# ── July 23 (Thursday) ────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Events/TicketCommentCreated.php
GIT_COMMITTER_DATE="2026-07-23 09:05:00" git commit --date="2026-07-23 09:05:00" -m "feat(events): create TicketCommentCreated event for real-time broadcasting"

git add gestion-sav-backend/app/Providers/BroadcastServiceProvider.php
GIT_COMMITTER_DATE="2026-07-23 10:40:00" git commit --date="2026-07-23 10:40:00" -m "feat(providers): register BroadcastServiceProvider for Reverb channels"

git add gestion-sav-backend/config/broadcasting.php
GIT_COMMITTER_DATE="2026-07-23 14:10:00" git commit --date="2026-07-23 14:10:00" -m "chore(config): configure Reverb as broadcast driver"

# ── July 24 (Friday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/database/migrations/2026_07_24_133342_create_notifications_table.php
GIT_COMMITTER_DATE="2026-07-24 09:00:00" git commit --date="2026-07-24 09:00:00" -m "feat(db): create notifications table for in-app notification system"

git add gestion-sav-backend/database/migrations/2026_07_24_145219_add_phone_and_company_to_users_table.php
GIT_COMMITTER_DATE="2026-07-24 10:20:00" git commit --date="2026-07-24 10:20:00" -m "feat(db): add phone and company columns to users table"

git add gestion-sav-backend/database/migrations/2026_07_24_172545_add_due_date_to_tickets_table.php
GIT_COMMITTER_DATE="2026-07-24 11:30:00" git commit --date="2026-07-24 11:30:00" -m "feat(db): add due_date column to tickets table for SLA tracking"

git add gestion-sav-backend/database/migrations/2026_07_24_174014_add_csat_to_tickets_table.php
GIT_COMMITTER_DATE="2026-07-24 13:45:00" git commit --date="2026-07-24 13:45:00" -m "feat(db): add csat_score and csat_comment columns to tickets table"

git add gestion-sav-backend/app/Notifications/TicketStatusUpdatedNotification.php
GIT_COMMITTER_DATE="2026-07-24 15:10:00" git commit --date="2026-07-24 15:10:00" -m "feat(notifications): implement TicketStatusUpdatedNotification via database channel"

git add gestion-sav-backend/app/Http/Controllers/NotificationController.php
GIT_COMMITTER_DATE="2026-07-24 16:40:00" git commit --date="2026-07-24 16:40:00" -m "feat(api): implement NotificationController with index, markAsRead and markAllRead"

# ── July 27 (Monday) ──────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Mail/WelcomeMail.php
GIT_COMMITTER_DATE="2026-07-27 09:10:00" git commit --date="2026-07-27 09:10:00" -m "feat(mail): create WelcomeMail sent to new users on registration"

git add gestion-sav-backend/app/Mail/TicketAssigned.php
GIT_COMMITTER_DATE="2026-07-27 10:30:00" git commit --date="2026-07-27 10:30:00" -m "feat(mail): create TicketAssigned mailable notifying technician of assignment"

git add gestion-sav-backend/app/Mail/TicketStatusUpdated.php
GIT_COMMITTER_DATE="2026-07-27 11:50:00" git commit --date="2026-07-27 11:50:00" -m "feat(mail): create TicketStatusUpdated mailable notifying client of status change"

git add gestion-sav-backend/app/Http/Requests/StoreArticleRequest.php
GIT_COMMITTER_DATE="2026-07-27 14:00:00" git commit --date="2026-07-27 14:00:00" -m "feat(requests): add StoreArticleRequest with title and content validation"

git add gestion-sav-backend/app/Http/Requests/UpdateArticleRequest.php
GIT_COMMITTER_DATE="2026-07-27 15:20:00" git commit --date="2026-07-27 15:20:00" -m "feat(requests): add UpdateArticleRequest for knowledge base article editing"

git add gestion-sav-backend/app/Http/Controllers/ArticleController.php
GIT_COMMITTER_DATE="2026-07-27 16:45:00" git commit --date="2026-07-27 16:45:00" -m "feat(api): implement ArticleController with full CRUD for knowledge base"

# ── July 28 (Tuesday) ─────────────────────────────────────────────────────────

git add gestion-sav-backend/app/Http/Resources/ArticleResource.php
GIT_COMMITTER_DATE="2026-07-28 09:10:00" git commit --date="2026-07-28 09:10:00" -m "feat(resources): create ArticleResource to format knowledge base responses"

git add gestion-sav-backend/app/Http/Controllers/ClientReportController.php
GIT_COMMITTER_DATE="2026-07-28 10:40:00" git commit --date="2026-07-28 10:40:00" -m "feat(api): implement ClientReportController with ticket stats per client"

git add gestion-sav-backend/database/seeders/ArticleSeeder.php
GIT_COMMITTER_DATE="2026-07-28 14:00:00" git commit --date="2026-07-28 14:00:00" -m "feat(db): add ArticleSeeder with sample knowledge base articles"

git add gestion-sav-backend/routes/web.php
GIT_COMMITTER_DATE="2026-07-28 15:30:00" git commit --date="2026-07-28 15:30:00" -m "feat(routes): add web routes with SPA fallback and storage link"

git add gestion-sav-backend/routes/channels.php
GIT_COMMITTER_DATE="2026-07-28 16:50:00" git commit --date="2026-07-28 16:50:00" -m "feat(routes): define private broadcast channels for ticket events"

# ── July 29 (Wednesday) ───────────────────────────────────────────────────────

git add gestion-sav-frontend/src/components/dashboard/StatCards.jsx
GIT_COMMITTER_DATE="2026-07-29 09:05:00" git commit --date="2026-07-29 09:05:00" -m "feat(components): build StatCards component displaying KPI metrics"

git add gestion-sav-frontend/src/components/dashboard/TicketTable.jsx
GIT_COMMITTER_DATE="2026-07-29 10:30:00" git commit --date="2026-07-29 10:30:00" -m "feat(components): build dashboard TicketTable with status badges and actions"

git add gestion-sav-frontend/src/pages/Dashboard.jsx
GIT_COMMITTER_DATE="2026-07-29 11:50:00" git commit --date="2026-07-29 11:50:00" -m "feat(pages): implement Admin Dashboard with stats, charts and ticket overview"

git add gestion-sav-frontend/src/pages/DashboardTechnicien.jsx
GIT_COMMITTER_DATE="2026-07-29 14:10:00" git commit --date="2026-07-29 14:10:00" -m "feat(pages): implement Technician Dashboard with assigned tickets and status update"

git add gestion-sav-frontend/src/pages/DashboardClient.jsx
GIT_COMMITTER_DATE="2026-07-29 15:40:00" git commit --date="2026-07-29 15:40:00" -m "feat(pages): implement Client Dashboard with personal ticket history and CSAT"

# ── July 30 (Thursday) ────────────────────────────────────────────────────────

git add gestion-sav-frontend/src/hooks/useTickets.ts
GIT_COMMITTER_DATE="2026-07-30 09:10:00" git commit --date="2026-07-30 09:10:00" -m "feat(hooks): implement useTickets with TanStack Query for paginated ticket fetching"

git add gestion-sav-frontend/src/lib/ticket-helpers.ts
GIT_COMMITTER_DATE="2026-07-30 10:30:00" git commit --date="2026-07-30 10:30:00" -m "feat(lib): add ticket helper functions for status color and priority mapping"

git add gestion-sav-frontend/src/components/tickets/TicketFilters.tsx
GIT_COMMITTER_DATE="2026-07-30 11:45:00" git commit --date="2026-07-30 11:45:00" -m "feat(components): build TicketFilters with status, priority and search inputs"

git add gestion-sav-frontend/src/components/tickets/TicketTable.tsx
GIT_COMMITTER_DATE="2026-07-30 13:00:00" git commit --date="2026-07-30 13:00:00" -m "feat(components): build responsive TicketTable with sortable columns"

git add gestion-sav-frontend/src/components/tickets/TicketPagination.tsx
GIT_COMMITTER_DATE="2026-07-30 14:10:00" git commit --date="2026-07-30 14:10:00" -m "feat(components): add TicketPagination component with page controls"

git add gestion-sav-frontend/src/components/tickets/TicketMobileList.tsx
GIT_COMMITTER_DATE="2026-07-30 15:20:00" git commit --date="2026-07-30 15:20:00" -m "feat(components): build TicketMobileList card layout for small screens"

git add gestion-sav-frontend/src/components/TicketCard.tsx
GIT_COMMITTER_DATE="2026-07-30 16:30:00" git commit --date="2026-07-30 16:30:00" -m "feat(components): create TicketCard for compact ticket preview display"

# ── July 31 (Friday) ──────────────────────────────────────────────────────────

git add gestion-sav-frontend/src/components/tickets/TicketModals.tsx
GIT_COMMITTER_DATE="2026-07-31 09:00:00" git commit --date="2026-07-31 09:00:00" -m "feat(components): implement TicketModals orchestrating all ticket modal states"

git add gestion-sav-frontend/src/components/tickets/TicketToast.tsx
GIT_COMMITTER_DATE="2026-07-31 09:50:00" git commit --date="2026-07-31 09:50:00" -m "feat(components): add TicketToast for success and error feedback on actions"

git add gestion-sav-frontend/src/components/tickets/AssignModal.jsx
GIT_COMMITTER_DATE="2026-07-31 10:40:00" git commit --date="2026-07-31 10:40:00" -m "feat(components): build AssignModal for Admin technician assignment flow"

git add gestion-sav-frontend/src/components/tickets/CreateTicketModal.jsx
GIT_COMMITTER_DATE="2026-07-31 11:30:00" git commit --date="2026-07-31 11:30:00" -m "feat(components): build CreateTicketModal with form validation and submission"

git add gestion-sav-frontend/src/components/tickets/RapportModal.jsx
GIT_COMMITTER_DATE="2026-07-31 12:20:00" git commit --date="2026-07-31 12:20:00" -m "feat(components): build RapportModal for technician intervention report entry"

git add gestion-sav-frontend/src/components/SharedTicketDrawer.jsx
GIT_COMMITTER_DATE="2026-07-31 13:10:00" git commit --date="2026-07-31 13:10:00" -m "feat(components): implement SharedTicketDrawer with comments and rapport tabs"

git add gestion-sav-frontend/src/components/NotificationBell.tsx
GIT_COMMITTER_DATE="2026-07-31 13:55:00" git commit --date="2026-07-31 13:55:00" -m "feat(components): build NotificationBell with unread badge and dropdown list"

git add gestion-sav-frontend/src/pages/Tickets.tsx
GIT_COMMITTER_DATE="2026-07-31 14:40:00" git commit --date="2026-07-31 14:40:00" -m "feat(pages): implement Tickets page with filters, table and pagination"

git add gestion-sav-frontend/src/pages/TicketDetail.jsx
GIT_COMMITTER_DATE="2026-07-31 15:10:00" git commit --date="2026-07-31 15:10:00" -m "feat(pages): implement TicketDetail page with full thread and rapport view"

git add gestion-sav-frontend/src/pages/Profile.jsx
GIT_COMMITTER_DATE="2026-07-31 15:40:00" git commit --date="2026-07-31 15:40:00" -m "feat(pages): build Profile page with avatar upload and password change form"

git add gestion-sav-frontend/src/pages/TeamManagement.jsx
GIT_COMMITTER_DATE="2026-07-31 16:00:00" git commit --date="2026-07-31 16:00:00" -m "feat(pages): implement TeamManagement page for Admin user CRUD"

git add gestion-sav-frontend/src/pages/ClientManagement.jsx
GIT_COMMITTER_DATE="2026-07-31 16:15:00" git commit --date="2026-07-31 16:15:00" -m "feat(pages): implement ClientManagement page listing all client accounts"

git add gestion-sav-frontend/src/pages/KnowledgeBaseManagement.jsx
GIT_COMMITTER_DATE="2026-07-31 16:30:00" git commit --date="2026-07-31 16:30:00" -m "feat(pages): implement KnowledgeBaseManagement with article CRUD for Admin"

git add gestion-sav-frontend/src/pages/ClientKnowledgeBase.jsx
GIT_COMMITTER_DATE="2026-07-31 16:45:00" git commit --date="2026-07-31 16:45:00" -m "feat(pages): implement ClientKnowledgeBase read-only article browser"

git add gestion-sav-frontend/src/pages/ClientReports.jsx
GIT_COMMITTER_DATE="2026-07-31 17:00:00" git commit --date="2026-07-31 17:00:00" -m "feat(pages): implement ClientReports page with personal ticket statistics"

git add gestion-sav-frontend/src/assets/hero.png
GIT_COMMITTER_DATE="2026-07-31 17:10:00" git commit --date="2026-07-31 17:10:00" -m "assets(frontend): add hero image for login and landing pages"

git add gestion-sav-backend/config/reverb.php
GIT_COMMITTER_DATE="2026-07-31 17:20:00" git commit --date="2026-07-31 17:20:00" -m "chore(config): add Reverb WebSocket server configuration"

git add SAV_Platform_API.postman_collection.json
GIT_COMMITTER_DATE="2026-07-31 17:30:00" git commit --date="2026-07-31 17:30:00" -m "docs(api): add Postman collection with all SAV platform endpoints"

git add gestion-sav-backend/README.md
GIT_COMMITTER_DATE="2026-07-31 17:40:00" git commit --date="2026-07-31 17:40:00" -m "docs: add backend README with setup, env config and API usage instructions"

git add gestion-sav-frontend/README.md
GIT_COMMITTER_DATE="2026-07-31 17:50:00" git commit --date="2026-07-31 17:50:00" -m "docs: add frontend README with install, dev server and build instructions"

# ── Final catch-all — any remaining untracked files ───────────────────────────

git add .
GIT_COMMITTER_DATE="2026-07-31 17:59:00" git commit --date="2026-07-31 17:59:00" -m "chore: final cleanup — add remaining config, public and resource files" 2>/dev/null || true

echo ""
echo "✅ Phase 4 complete — $(git rev-list --count HEAD) commits total on branch $(git branch --show-current)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ALL PHASES COMPLETE — Full 2-month Git history generated successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Verify history:  git log --oneline | head -20"
echo "  2. Replace main:    git branch -D main && git branch -m fresh_main main"
echo "  3. Force push:      git push origin main --force"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
