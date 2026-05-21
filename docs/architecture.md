# Project "AGOS-BD" Architecture

## Frontend

- Next.js App Router for landing, map, reports, dashboard, and admin views
- React Query for server-state caching
- Zustand for map filters, emergency overlays, and UI state
- Tailwind CSS with custom tokens for AGOS-BD brand styling
- Supabase client for auth and realtime subscriptions
- OpenStreetMap-ready map layer with room for Leaflet or similar client rendering

## Backend

- Express REST API with route modules
- Zod validation for request payloads
- Centralized error handling and audit-friendly logging
- Supabase Admin client for secure server-side data access
- Rate limiting and role-aware middleware

## Data Flow

1. Guests browse the public map and search active reports.
2. Reports and emergency requests are written through the API.
3. Supabase Realtime fans updates to map subscribers.
4. Admin actions update moderation logs, verification state, and analytics rows.

## Roles

- `guest`
- `user`
- `admin`

Verified sources are modeled separately from auth roles so organizations can be highlighted without introducing extra account-role complexity.
