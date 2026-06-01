# Project Structure

```
vlaad-platform/
├── apps/
│   ├── api/                        # Express REST API (@vlaad/api)
│   │   └── src/
│   │       ├── config/env.ts       # Validated env vars (single source of truth)
│   │       ├── lib/                # supabase admin client, logger
│   │       ├── middleware/         # auth, requireRole, validate, sanitize, rate-limit, error-handler
│   │       ├── routes/             # One file per resource (reports.routes.ts, etc.)
│   │       ├── services/           # Business logic; routes call services, not DB directly
│   │       ├── types/express.d.ts  # Augments Request with `auth` payload
│   │       ├── utils/              # ApiError, asyncHandler
│   │       ├── validators/         # Zod schemas co-located by domain
│   │       ├── app.ts              # Express app factory (createApp)
│   │       └── index.ts            # Server entry point
│   │
│   └── web/                        # Next.js frontend (@vlaad/web)
│       ├── app/                    # App Router pages
│       │   ├── (app)/              # Authenticated route group — uses AppShell layout
│       │   │   ├── dashboard/
│       │   │   ├── map/
│       │   │   ├── reports/
│       │   │   ├── profile/
│       │   │   ├── patch-notes/
│       │   │   └── admin/          # Admin-only page inside auth group
│       │   ├── admin/login/        # Standalone admin login (outside auth group)
│       │   ├── login/
│       │   ├── register/
│       │   └── page.tsx            # Public landing page
│       ├── components/
│       │   ├── ui/                 # Primitive shadcn-style components (Button, Card, Badge…)
│       │   ├── layout/             # AppShell, Sidebar, Topbar, FloatingActions
│       │   ├── auth/               # AuthGuard, LoginPanel, LogoutButton
│       │   ├── map/                # LiveMap, MapShell
│       │   ├── reports/            # ReportForm, ReportModal, ReportLocationPicker
│       │   ├── dashboard/          # StatsGrid, AchievementPopup
│       │   ├── admin/              # AdminDashboard, PatchNotesDashboard
│       │   ├── home/               # PublicHome, PublicAnnouncements
│       │   └── providers.tsx       # QueryClientProvider wrapper
│       ├── hooks/                  # Custom React hooks (use-realtime-feed, use-notifications…)
│       ├── lib/                    # Non-component utilities
│       │   ├── api.ts              # apiUrl() helper
│       │   ├── auth.ts             # Token read/write, session decode, role routing
│       │   ├── config.ts           # Frontend config constants
│       │   ├── query-client.ts     # TanStack Query client factory
│       │   ├── utils.ts            # cn() and other helpers
│       │   └── supabase/client.ts  # Browser Supabase client
│       └── store/
│           └── use-app-store.ts    # Zustand store (map filters, UI state)
│
├── packages/
│   └── shared/src/                 # @vlaad/shared — shared between api and web
│       ├── types.ts                # Domain interfaces (BloodReport, EmergencyRequest, etc.)
│       ├── constants.ts            # as-const arrays (BLOOD_TYPES, USER_ROLES, etc.)
│       └── index.ts                # Re-exports
│
├── supabase/
│   └── migrations/                 # SQL migration files (apply in order)
│
├── docs/
│   ├── api.md                      # API endpoint reference
│   ├── architecture.md             # System architecture overview
│   └── deployment.md               # Deployment notes
│
├── .env                            # Environment variables (never commit secrets)
├── package.json                    # Root scripts and pnpm workspace config
├── pnpm-workspace.yaml
└── tsconfig.base.json              # Shared TS compiler options
```

## Key Conventions

### API
- Routes are thin — they validate input and delegate to a service function
- All async route handlers use `asyncHandler()` wrapper
- Throw `ApiError(statusCode, message)` from services; the error handler catches it
- Zod schemas live in `validators/` and are imported by both routes and services as needed
- `requireAuth` and `requireRole([...])` are applied per-route, not globally

### Frontend
- Pages in `app/(app)/` are for authenticated users; `AuthGuard` enforces this at the layout level
- Server state (API/Supabase data) → TanStack Query hooks in `hooks/`
- Client/UI state (filters, overlays) → Zustand store in `store/`
- Supabase Realtime subscriptions are set up inside `useEffect` in custom hooks, not in components
- Use `apiUrl(path)` from `lib/api.ts` for all fetch calls to the Express API
- `"use client"` directive is required on any file using hooks, browser APIs, or event handlers

### Shared
- Add new domain types to `packages/shared/src/types.ts` and constants to `constants.ts`
- Both `api` and `web` import from `@vlaad/shared` — never duplicate type definitions across apps
