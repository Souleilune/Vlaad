# Tech Stack

## Monorepo

- **Package manager**: pnpm 10 with workspaces
- **Workspace packages**: `apps/web`, `apps/api`, `packages/shared`
- **Base TypeScript config**: `tsconfig.base.json` at root — all packages extend it
- **Strict mode**: enabled with `noUncheckedIndexedAccess`

## Frontend (`apps/web`)

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5, React 19
- **Styling**: Tailwind CSS 3 + `tailwind-merge` + `class-variance-authority`
- **UI components**: shadcn-style primitives in `components/ui/`
- **Icons**: `lucide-react`
- **Animations**: `framer-motion`
- **Server state**: TanStack React Query 5
- **Client state**: Zustand 5
- **Maps**: Leaflet + `react-leaflet` (OpenStreetMap tiles)
- **Charts**: Recharts
- **Auth**: JWT stored in `localStorage` under key `vlaad_token`, decoded client-side via `lib/auth.ts`
- **Supabase**: browser client in `lib/supabase/client.ts` for auth and Realtime subscriptions
- **API calls**: all REST calls go through `lib/api.ts` → `apiUrl(path)` which resolves to `NEXT_PUBLIC_API_BASE_URL`

## Backend (`apps/api`)

- **Runtime**: Node.js with `tsx` for dev (ESM)
- **Framework**: Express 4
- **Language**: TypeScript 5
- **Validation**: Zod — all request bodies validated via `validateBody(schema)` middleware
- **Auth**: JWT verified against `SUPABASE_JWT_SECRET`; `optionalAuth` applied globally, `requireAuth` / `requireRole` per route
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js` admin client
- **Security**: `helmet`, `cors`, `express-rate-limit`, body sanitization middleware
- **Logging**: `morgan` (HTTP) + custom `logger.ts` with `logInfo` / `createTimer`
- **Error handling**: `ApiError` class → centralized `errorHandler` middleware
- **Async routes**: all handlers wrapped in `asyncHandler` to forward thrown errors

## Shared Package (`packages/shared`)

- Domain types (`BloodReport`, `EmergencyRequest`, `VerifiedSource`, etc.) and constants (`BLOOD_TYPES`, `USER_ROLES`, etc.)
- Imported as `@vlaad/shared` in both `web` and `api`
- No runtime dependencies — types and `as const` arrays only

## Database

- Supabase PostgreSQL with RLS
- Migrations in `supabase/migrations/`
- Realtime enabled on `blood_reports` table

## Common Commands

```bash
# Install all dependencies
pnpm install

# Run both apps in parallel (web on :3000, api on :4000)
pnpm dev

# Run individually
pnpm dev:web
pnpm dev:api

# Build all packages
pnpm build

# Type-check all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

## Environment Variables

Copy `.env` at the repo root. Key variables:
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_JWT_SECRET`
- `NEXT_PUBLIC_API_BASE_URL` — frontend → API base (default: `http://localhost:4000`)
- `CLIENT_ORIGIN` — CORS allowed origin for the API
