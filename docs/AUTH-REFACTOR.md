Auth refactor notes

Overview
- Consolidated JWT/token and auth helpers into `backend/src/utils/auth.ts`.
- Controllers, services, and middleware now use normalized email handling and a consistent error response shape: { status: 'error', message, details? }.
- Frontend now uses a central `apiFetch` helper and `notify` wrapper to normalize errors and toasts.

Key changes made
- Moved token helpers and cookie options into a single `auth.ts` util.
- Zod validators tightened (trim(), toLowerCase()) and types exported.
- Frontend: added `frontend/src/lib/api.ts` and `frontend/src/lib/notify.ts` and updated `services/auth.ts` to use them.

Edge cases / next steps
- Database migration: prisma schema changed; run `npx prisma migrate dev --name add-is-active` locally before using the app.
- Refresh token rotation: current flow issues new refresh tokens but does not revoke old ones; consider storing refresh tokens in DB and rotating/revoking on use.
- Rate limiting & brute force: add rate-limit middleware for signin/signup endpoints.
- Email verification / activation UI: currently first user auto-activated; others require admin activation via DB or an admin endpoint.
- Password rules: currently minimum length enforced; consider stronger policies (uppercase, symbols) if required.
- Error shapes from Prisma/Zod: controllers map Zod issues to details but Prisma unique constraint errors may still return raw messages; consider parsing Prisma error codes.

How to test locally
- Backend: run `npm run dev` in `/backend`.
- Frontend: run `npm run dev` in `/frontend`.
- Create first user via SignUp -> should be active and redirect to /setup.
- Create second user -> will be inactive; signin should be blocked.

