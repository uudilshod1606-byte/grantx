-- INTIL AI study plans: persist the generated plan so the dashboard can
-- load it after onboarding without relying on browser-only state.

alter table public.student_profiles
  add column if not exists selected_subjects text[] not null default '{}',
  add column if not exists weak_points jsonb not null default '{}'::jsonb;

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text,
  plan jsonb not null default '{}'::jsonb,
  model text,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_plans_user_generated_idx
  on public.study_plans(user_id, generated_at desc);

alter table public.study_plans enable row level security;

drop policy if exists "study_plans_select_own" on public.study_plans;
create policy "study_plans_select_own"
on public.study_plans for select
using (auth.uid() = user_id);

drop policy if exists "study_plans_insert_own" on public.study_plans;
create policy "study_plans_insert_own"
on public.study_plans for insert
with check (auth.uid() = user_id);

drop policy if exists "study_plans_update_own" on public.study_plans;
create policy "study_plans_update_own"
on public.study_plans for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists study_plans_set_updated_at on public.study_plans;
create trigger study_plans_set_updated_at
before update on public.study_plans
for each row execute function public.set_updated_at();
