#!/bin/bash
# ==============================================================================
# PHASE 3 — July 1 to July 15: Frontend React Setup, Tailwind, Routing,
#            Layouts, Auth Pages, Base UI Components, Services, Context
# ==============================================================================

set -e
cd "$(dirname "$0")"

echo "▶ Phase 3 — Frontend React Setup, UI, Routing..."

# ── July 01 (Wednesday) ───────────────────────────────────────────────────────

git add gestion-sav-frontend/.gitignore
GIT_COMMITTER_DATE="2026-07-01 09:08:00" git commit --date="2026-07-01 09:08:00" -m "chore(frontend): init frontend .gitignore"

git add gestion-sav-frontend/package.json
GIT_COMMITTER_DATE="2026-07-01 09:50:00" git commit --date="2026-07-01 09:50:00" -m "chore(frontend): add package.json with React 19, Vite, TanStack Query and Framer Motion"

git add gestion-sav-frontend/package-lock.json
GIT_COMMITTER_DATE="2026-07-01 10:30:00" git commit --date="2026-07-01 10:30:00" -m "chore(frontend): lock npm dependencies"

# ── July 02 (Thursday) ────────────────────────────────────────────────────────

git add gestion-sav-frontend/vite.config.js
GIT_COMMITTER_DATE="2026-07-02 09:15:00" git commit --date="2026-07-02 09:15:00" -m "chore(frontend): configure Vite with React plugin and dev server proxy"

git add gestion-sav-frontend/tsconfig.json
GIT_COMMITTER_DATE="2026-07-02 10:40:00" git commit --date="2026-07-02 10:40:00" -m "chore(frontend): add TypeScript compiler config"

git add gestion-sav-frontend/tsconfig.node.json
GIT_COMMITTER_DATE="2026-07-02 11:20:00" git commit --date="2026-07-02 11:20:00" -m "chore(frontend): add tsconfig.node.json for Vite build tooling"

git add gestion-sav-frontend/tailwind.config.js
GIT_COMMITTER_DATE="2026-07-02 14:10:00" git commit --date="2026-07-02 14:10:00" -m "chore(frontend): configure Tailwind CSS v4 with content paths"

# ── July 03 (Friday) ──────────────────────────────────────────────────────────

git add gestion-sav-frontend/eslint.config.js
GIT_COMMITTER_DATE="2026-07-03 09:10:00" git commit --date="2026-07-03 09:10:00" -m "chore(frontend): add ESLint config with React hooks and refresh plugins"

git add gestion-sav-frontend/index.html
GIT_COMMITTER_DATE="2026-07-03 10:30:00" git commit --date="2026-07-03 10:30:00" -m "chore(frontend): add root index.html entry point"

git add gestion-sav-frontend/src/index.css
GIT_COMMITTER_DATE="2026-07-03 11:45:00" git commit --date="2026-07-03 11:45:00" -m "style(frontend): add global CSS with Tailwind directives"

git add gestion-sav-frontend/src/main.jsx
GIT_COMMITTER_DATE="2026-07-03 14:20:00" git commit --date="2026-07-03 14:20:00" -m "feat(frontend): bootstrap React app with QueryClient and Router providers"

# ── July 06 (Monday) ──────────────────────────────────────────────────────────

git add gestion-sav-frontend/src/App.css
GIT_COMMITTER_DATE="2026-07-06 09:05:00" git commit --date="2026-07-06 09:05:00" -m "style(frontend): add base App CSS resets and layout utilities"

git add gestion-sav-frontend/src/App.jsx
GIT_COMMITTER_DATE="2026-07-06 10:30:00" git commit --date="2026-07-06 10:30:00" -m "feat(frontend): define root App component with react-router-dom v7 routes"

git add gestion-sav-frontend/src/constants/enums.js
GIT_COMMITTER_DATE="2026-07-06 14:00:00" git commit --date="2026-07-06 14:00:00" -m "feat(constants): add shared enums for ticket status, priority and roles"

# ── July 07 (Tuesday) ─────────────────────────────────────────────────────────

git add gestion-sav-frontend/src/context/AuthContext.jsx
GIT_COMMITTER_DATE="2026-07-07 09:20:00" git commit --date="2026-07-07 09:20:00" -m "feat(context): implement AuthContext with login, logout and user state"

git add gestion-sav-frontend/src/services/api.js
GIT_COMMITTER_DATE="2026-07-07 11:10:00" git commit --date="2026-07-07 11:10:00" -m "feat(services): configure axios instance with base URL and auth interceptors"

git add gestion-sav-frontend/src/utils/helpers.js
GIT_COMMITTER_DATE="2026-07-07 14:30:00" git commit --date="2026-07-07 14:30:00" -m "feat(utils): add shared helper functions for date formatting and status labels"

# ── July 08 (Wednesday) ───────────────────────────────────────────────────────

git add gestion-sav-frontend/src/components/ProtectedRoute.jsx
GIT_COMMITTER_DATE="2026-07-08 09:15:00" git commit --date="2026-07-08 09:15:00" -m "feat(components): implement ProtectedRoute with role-based redirect guard"

git add gestion-sav-frontend/src/components/ErrorBoundary.jsx
GIT_COMMITTER_DATE="2026-07-08 10:50:00" git commit --date="2026-07-08 10:50:00" -m "feat(components): add ErrorBoundary component for graceful error handling"

git add gestion-sav-frontend/src/components/Logo.jsx
GIT_COMMITTER_DATE="2026-07-08 14:10:00" git commit --date="2026-07-08 14:10:00" -m "feat(components): create Logo component with TechIntervention branding"

# ── July 09 (Thursday) ────────────────────────────────────────────────────────

git add gestion-sav-frontend/src/components/AppLayout.jsx
GIT_COMMITTER_DATE="2026-07-09 09:10:00" git commit --date="2026-07-09 09:10:00" -m "feat(layout): create AppLayout with sidebar navigation for Admin and Technician"

git add gestion-sav-frontend/src/components/ClientLayout.jsx
GIT_COMMITTER_DATE="2026-07-09 11:00:00" git commit --date="2026-07-09 11:00:00" -m "feat(layout): create ClientLayout with top navbar for Client role"

git add gestion-sav-frontend/src/components/ClientNavbar.jsx
GIT_COMMITTER_DATE="2026-07-09 14:30:00" git commit --date="2026-07-09 14:30:00" -m "feat(components): build ClientNavbar with user menu and logout action"

# ── July 10 (Friday) ──────────────────────────────────────────────────────────

git add gestion-sav-frontend/src/pages/Login.jsx
GIT_COMMITTER_DATE="2026-07-10 09:20:00" git commit --date="2026-07-10 09:20:00" -m "feat(pages): build Login page with form validation and AuthContext integration"

git add gestion-sav-frontend/src/pages/Register.jsx
GIT_COMMITTER_DATE="2026-07-10 11:15:00" git commit --date="2026-07-10 11:15:00" -m "feat(pages): build Register page with role selection and API submission"

git add gestion-sav-frontend/src/pages/auth/AwaitingVerification.jsx
GIT_COMMITTER_DATE="2026-07-10 14:40:00" git commit --date="2026-07-10 14:40:00" -m "feat(pages): add AwaitingVerification page shown after registration"

# ── July 13 (Monday) ──────────────────────────────────────────────────────────

git add gestion-sav-frontend/src/pages/VerifyEmail.tsx
GIT_COMMITTER_DATE="2026-07-13 09:10:00" git commit --date="2026-07-13 09:10:00" -m "feat(pages): implement VerifyEmail page handling signed verification link"

git add gestion-sav-frontend/src/pages/ForgotPassword.tsx
GIT_COMMITTER_DATE="2026-07-13 10:55:00" git commit --date="2026-07-13 10:55:00" -m "feat(pages): build ForgotPassword page with email submission form"

git add gestion-sav-frontend/src/pages/ResetPassword.tsx
GIT_COMMITTER_DATE="2026-07-13 14:20:00" git commit --date="2026-07-13 14:20:00" -m "feat(pages): build ResetPassword page consuming token from URL params"

# ── July 14 (Tuesday) ─────────────────────────────────────────────────────────

git add gestion-sav-frontend/src/pages/errors/NotFound.jsx
GIT_COMMITTER_DATE="2026-07-14 09:05:00" git commit --date="2026-07-14 09:05:00" -m "feat(pages): add 404 NotFound error page"

git add gestion-sav-frontend/src/pages/errors/Forbidden.jsx
GIT_COMMITTER_DATE="2026-07-14 10:30:00" git commit --date="2026-07-14 10:30:00" -m "feat(pages): add 403 Forbidden error page for unauthorized access"

git add gestion-sav-frontend/src/components/ui/ErrorState.jsx
GIT_COMMITTER_DATE="2026-07-14 13:45:00" git commit --date="2026-07-14 13:45:00" -m "feat(ui): create reusable ErrorState component for API error display"

git add gestion-sav-frontend/src/components/ui/Skeletons.jsx
GIT_COMMITTER_DATE="2026-07-14 15:30:00" git commit --date="2026-07-14 15:30:00" -m "feat(ui): create Skeletons component for loading state placeholders"

# ── July 15 (Wednesday) ───────────────────────────────────────────────────────

git add gestion-sav-frontend/src/utils/animations.js
GIT_COMMITTER_DATE="2026-07-15 09:20:00" git commit --date="2026-07-15 09:20:00" -m "feat(utils): add Framer Motion animation variants for page transitions"

git add gestion-sav-frontend/src/services/echo.js
GIT_COMMITTER_DATE="2026-07-15 11:10:00" git commit --date="2026-07-15 11:10:00" -m "feat(services): configure Laravel Echo with Reverb for real-time events"

git add gestion-sav-frontend/src/components/Notification.jsx
GIT_COMMITTER_DATE="2026-07-15 14:50:00" git commit --date="2026-07-15 14:50:00" -m "feat(components): build Notification toast component for in-app alerts"

git add gestion-sav-frontend/.env
GIT_COMMITTER_DATE="2026-07-15 16:30:00" git commit --date="2026-07-15 16:30:00" -m "chore(frontend): add .env with API base URL and Reverb connection config"

echo ""
echo "✅ Phase 3 complete — $(git rev-list --count HEAD) commits total on branch $(git branch --show-current)"
echo "👉 Ready for Phase 4?"
