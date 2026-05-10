# Deployment Setup

## Frontend

- Deploy `apps/web` to Vercel or any Node-compatible Next.js host.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Point frontend API calls to the deployed Express API base URL.

## API

- Deploy `apps/api` to Railway, Render, Fly.io, or a container host.
- Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, and `CLIENT_ORIGIN`.
- Terminate TLS at the platform edge and restrict CORS to the web origin.

## Supabase

- Run `supabase/migrations/0001_init.sql`.
- Enable Auth providers for email/password and Google.
- Create storage buckets such as `report-images` with signed upload URLs.
- Enable Realtime on `blood_reports`, `emergency_requests`, and `notifications`.

## Suggested Production Add-ons

- Edge caching for public map search responses
- Image moderation queue backed by storage webhooks
- Scheduled jobs for report expiration and analytics rollups
- Error monitoring via Sentry or OpenTelemetry
