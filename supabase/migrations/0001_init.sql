create extension if not exists "pgcrypto";
create extension if not exists "postgis";

create type public.app_role as enum ('guest', 'user', 'admin');
create type public.blood_type as enum ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
create type public.report_source_type as enum ('community', 'trusted_contributor', 'verified_source');
create type public.report_status as enum ('pending', 'verified', 'rejected', 'expired');
create type public.urgency_level as enum ('low', 'medium', 'high', 'critical');
create type public.notification_category as enum ('nearby_alert', 'emergency_broadcast', 'reminder', 'system');
create type public.verified_source_type as enum ('hospital', 'red_cross', 'lgu', 'donation_center', 'volunteer_org');
create type public.emergency_status as enum ('open', 'matched', 'resolved', 'cancelled');

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  blood_type public.blood_type,
  phone text,
  city text,
  reputation_score integer not null default 0,
  contributor_level text not null default 'New Responder',
  trusted_contributor boolean not null default false,
  last_donation_date timestamptz,
  next_eligible_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references public.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.verified_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type public.verified_source_type not null,
  badge_label text not null default 'Verified Source',
  address text not null,
  city text,
  contact_number text,
  website_url text,
  latitude double precision not null,
  longitude double precision not null,
  location geography(point, 4326) generated always as (st_setsrid(st_makepoint(longitude, latitude), 4326)::geography) stored,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blood_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  verified_source_id uuid references public.verified_sources(id) on delete set null,
  title text not null,
  blood_type public.blood_type not null,
  organization_name text,
  description text not null,
  address text not null,
  city text,
  latitude double precision not null,
  longitude double precision not null,
  location geography(point, 4326) generated always as (st_setsrid(st_makepoint(longitude, latitude), 4326)::geography) stored,
  contact_number text,
  available_bags integer not null default 0 check (available_bags >= 0),
  expires_at timestamptz not null,
  verification_status public.report_status not null default 'pending',
  source_type public.report_source_type not null,
  is_emergency boolean not null default false,
  nickname text,
  anonymous_contact text,
  moderation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_images (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.blood_reports(id) on delete cascade,
  storage_path text not null,
  image_url text not null,
  moderation_status public.report_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.emergency_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  title text not null,
  patient_name text,
  blood_type public.blood_type not null,
  urgency_level public.urgency_level not null,
  hospital_name text,
  notes text not null,
  address text not null,
  city text,
  latitude double precision not null,
  longitude double precision not null,
  location geography(point, 4326) generated always as (st_setsrid(st_makepoint(longitude, latitude), 4326)::geography) stored,
  needed_by timestamptz not null,
  status public.emergency_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category public.notification_category not null,
  title text not null,
  body text not null,
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.donation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  donation_date timestamptz not null,
  location_name text not null,
  city text,
  blood_type public.blood_type not null,
  units_donated numeric(6,2) not null default 1,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.reputation_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  points integer not null,
  reason text not null,
  source_table text,
  source_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.report_flags (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.blood_reports(id) on delete cascade,
  flagged_by uuid references public.users(id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.users(id) on delete set null,
  target_table text not null,
  target_id uuid not null,
  action text not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  metric_key text not null,
  metric_value numeric(14,2) not null default 0,
  dimension jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (metric_date, metric_key, dimension)
);

create index if not exists idx_user_roles_role on public.user_roles(role);
create index if not exists idx_verified_sources_active on public.verified_sources(is_active);
create index if not exists idx_verified_sources_location on public.verified_sources using gist(location);
create index if not exists idx_blood_reports_status on public.blood_reports(verification_status, expires_at desc);
create index if not exists idx_blood_reports_blood_type on public.blood_reports(blood_type);
create index if not exists idx_blood_reports_source_type on public.blood_reports(source_type);
create index if not exists idx_blood_reports_location on public.blood_reports using gist(location);
create index if not exists idx_emergency_requests_status on public.emergency_requests(status, urgency_level, needed_by);
create index if not exists idx_emergency_requests_location on public.emergency_requests using gist(location);
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index if not exists idx_donation_history_user_date on public.donation_history(user_id, donation_date desc);
create index if not exists idx_reputation_scores_user_date on public.reputation_scores(user_id, created_at desc);
create index if not exists idx_report_flags_report on public.report_flags(report_id, created_at desc);
create index if not exists idx_moderation_logs_target on public.moderation_logs(target_table, target_id, created_at desc);
create index if not exists idx_analytics_metric_date on public.analytics(metric_key, metric_date desc);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_role()
returns public.app_role
language sql
stable
as $$
  select coalesce((select role from public.user_roles where user_id = auth.uid()), 'guest'::public.app_role);
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.handle_updated_at();

drop trigger if exists trg_verified_sources_updated_at on public.verified_sources;
create trigger trg_verified_sources_updated_at
before update on public.verified_sources
for each row execute function public.handle_updated_at();

drop trigger if exists trg_blood_reports_updated_at on public.blood_reports;
create trigger trg_blood_reports_updated_at
before update on public.blood_reports
for each row execute function public.handle_updated_at();

drop trigger if exists trg_emergency_requests_updated_at on public.emergency_requests;
create trigger trg_emergency_requests_updated_at
before update on public.emergency_requests
for each row execute function public.handle_updated_at();

alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.verified_sources enable row level security;
alter table public.blood_reports enable row level security;
alter table public.report_images enable row level security;
alter table public.emergency_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.donation_history enable row level security;
alter table public.reputation_scores enable row level security;
alter table public.report_flags enable row level security;
alter table public.moderation_logs enable row level security;
alter table public.analytics enable row level security;

create policy "users can read own profile"
on public.users for select
using (auth.uid() = id or public.is_admin());

create policy "users can create own profile"
on public.users for insert
with check (auth.uid() = id or public.is_admin());

create policy "users can update own profile"
on public.users for update
using (auth.uid() = id or public.is_admin());

create policy "users can read own role"
on public.user_roles for select
using (auth.uid() = user_id or public.is_admin());

create policy "admins manage roles"
on public.user_roles for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active verified sources"
on public.verified_sources for select
using (is_active = true or public.is_admin());

create policy "admins manage verified sources"
on public.verified_sources for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active blood reports"
on public.blood_reports for select
using (
  public.is_admin()
  or (
    verification_status in ('pending', 'verified')
    and expires_at > now()
  )
  or (auth.uid() is not null and user_id = auth.uid())
);

create policy "guests and users can insert reports"
on public.blood_reports for insert
with check (
  (
    auth.uid() is null
    and source_type = 'community'
  )
  or (
    auth.uid() is not null
    and (
      user_id = auth.uid()
      or public.is_admin()
    )
  )
);

create policy "owners and admins update reports"
on public.blood_reports for update
using (
  public.is_admin()
  or (auth.uid() is not null and user_id = auth.uid())
);

create policy "admins delete reports"
on public.blood_reports for delete
using (public.is_admin());

create policy "public can read report images"
on public.report_images for select
using (true);

create policy "owners and admins manage report images"
on public.report_images for all
using (
  public.is_admin()
  or exists (
    select 1 from public.blood_reports
    where id = report_images.report_id
      and user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.blood_reports
    where id = report_images.report_id
      and user_id = auth.uid()
  )
);

create policy "public can read emergency requests"
on public.emergency_requests for select
using (status <> 'cancelled' or public.is_admin());

create policy "guests and users can insert emergency requests"
on public.emergency_requests for insert
with check (true);

create policy "owners and admins update emergency requests"
on public.emergency_requests for update
using (
  public.is_admin()
  or (auth.uid() is not null and user_id = auth.uid())
);

create policy "users read own notifications"
on public.notifications for select
using (auth.uid() = user_id or public.is_admin());

create policy "users update own notifications"
on public.notifications for update
using (auth.uid() = user_id or public.is_admin());

create policy "admins insert notifications"
on public.notifications for insert
with check (public.is_admin());

create policy "users read own donation history"
on public.donation_history for select
using (auth.uid() = user_id or public.is_admin());

create policy "users manage own donation history"
on public.donation_history for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "users read own reputation"
on public.reputation_scores for select
using (auth.uid() = user_id or public.is_admin());

create policy "admins manage reputation"
on public.reputation_scores for all
using (public.is_admin())
with check (public.is_admin());

create policy "authenticated users can flag reports"
on public.report_flags for insert
with check (auth.uid() is not null);

create policy "admins read report flags"
on public.report_flags for select
using (public.is_admin());

create policy "admins manage moderation logs"
on public.moderation_logs for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins read analytics"
on public.analytics for select
using (public.is_admin());

create policy "admins manage analytics"
on public.analytics for all
using (public.is_admin())
with check (public.is_admin());
