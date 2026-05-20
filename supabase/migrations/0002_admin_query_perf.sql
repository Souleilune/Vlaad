create index if not exists idx_users_created_at on public.users(created_at desc);

create index if not exists idx_blood_reports_created_at on public.blood_reports(created_at desc);

create index if not exists idx_blood_reports_pending_created_at
on public.blood_reports(verification_status, created_at asc)
where verification_status = 'pending';

create or replace function public.get_admin_analytics_overview()
returns table (
  total_reports bigint,
  active_blood_availability bigint,
  active_emergencies bigint,
  resolved_requests bigint,
  user_growth bigint,
  verification_rate numeric(5,1)
)
language sql
stable
as $$
  with active_reports as (
    select verification_status, available_bags
    from public.blood_reports
    where verification_status in ('pending', 'verified')
      and expires_at > now()
  )
  select
    (select count(*) from public.blood_reports) as total_reports,
    coalesce((select sum(available_bags)::bigint from active_reports), 0) as active_blood_availability,
    (select count(*) from public.emergency_requests where status in ('open', 'matched')) as active_emergencies,
    (select count(*) from public.emergency_requests where status = 'resolved') as resolved_requests,
    (select count(*) from public.users where created_at >= now() - interval '30 days') as user_growth,
    coalesce(
      round(
        (
          (select count(*) filter (where verification_status = 'verified')::numeric from active_reports)
          / nullif((select count(*)::numeric from active_reports), 0)
        ) * 100,
        1
      ),
      0
    )::numeric(5,1) as verification_rate;
$$;
