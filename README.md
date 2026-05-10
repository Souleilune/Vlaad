# Vlaad: Blood Donation Tracker Platform

Vlaad is a modern full-stack emergency-first web platform for community blood availability reporting, live emergency requests, trusted-source verification, and donation tracking.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn-style UI, React Query, Zustand
- Backend: Node.js, Express, TypeScript
- Data: Supabase PostgreSQL, Auth, Realtime, Storage
- Maps: OpenStreetMap-first setup, suitable for Leaflet or other OSM-based renderers

## Workspace

- `apps/web`: Next.js frontend
- `apps/api`: Express API
- `packages/shared`: shared domain types and constants
- `supabase/migrations`: PostgreSQL schema, indexes, triggers, and RLS
- `docs`: architecture and API notes

## Quick Start

1. Copy `.env.example` to `.env`.
2. Create a Supabase project and apply `supabase/migrations/0001_init.sql`.
3. Install dependencies with `pnpm install`.
4. Run `pnpm dev`.

## Product Highlights

- Public emergency map for guests
- Anonymous community blood reports with rate limiting and moderation flow
- Registered donor dashboard with streaks, reputation, countdowns, and badges
- Admin moderation and analytics dashboard
- Verified source system for hospitals, LGUs, Red Cross branches, and donation centers
- Supabase Realtime powered live updates

## Design Direction

The UI blends modern healthcare SaaS patterns with retro pixel accents, glassmorphism, soft gradients, rounded surfaces, and emergency-friendly interaction density.
