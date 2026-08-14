-- INTIL AI foundation: persistent student profile, per-question attempts,
-- and topic mastery. This migration intentionally stores raw learning signals;
-- AI-generated plans/analysis will be added in later stages.

create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_exam text,
  target_score numeric,
  exam_date date,
  daily_study_minutes integer,
  study_days integer[] not null default '{}',
  current_level text,
  self_reported_weak_topics text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_profiles_daily_minutes_positive
    check (daily_study_minutes is null or daily_study_minutes > 0),
  constraint student_profiles_target_score_nonnegative
    check (target_score is null or target_score >= 0)
);

create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id text,
  question_id text not null,
  subject_id text not null,
  exam_kind text,
  exam_id text,
  category text,
  difficulty text,
  question_type text,
  selected_answer jsonb,
  correct_answer jsonb,
  is_correct boolean not null,
  time_spent_seconds integer,
  created_at timestamptz not null default now(),
  constraint question_attempts_time_nonnegative
    check (time_spent_seconds is null or time_spent_seconds >= 0)
);

create index if not exists question_attempts_user_created_idx
  on public.question_attempts(user_id, created_at desc);
create index if not exists question_attempts_user_topic_idx
  on public.question_attempts(user_id, subject_id, category);
create index if not exists question_attempts_question_idx
  on public.question_attempts(question_id);

create table if not exists public.topic_mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  topic text not null,
  mastery_score numeric not null default 0,
  questions_seen integer not null default 0,
  questions_correct integer not null default 0,
  average_time_seconds numeric,
  trend numeric not null default 0,
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id, topic),
  constraint topic_mastery_score_range
    check (mastery_score >= 0 and mastery_score <= 100),
  constraint topic_mastery_seen_nonnegative
    check (questions_seen >= 0),
  constraint topic_mastery_correct_nonnegative
    check (questions_correct >= 0)
);

create index if not exists topic_mastery_user_score_idx
  on public.topic_mastery(user_id, mastery_score asc);

-- Keep updated_at current without relying on the frontend.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_profiles_set_updated_at on public.student_profiles;
create trigger student_profiles_set_updated_at
before update on public.student_profiles
for each row execute function public.set_updated_at();

drop trigger if exists topic_mastery_set_updated_at on public.topic_mastery;
create trigger topic_mastery_set_updated_at
before update on public.topic_mastery
for each row execute function public.set_updated_at();

-- Row Level Security: students can only read/write their own learning data.
alter table public.student_profiles enable row level security;
alter table public.question_attempts enable row level security;
alter table public.topic_mastery enable row level security;

drop policy if exists "student_profiles_select_own" on public.student_profiles;
create policy "student_profiles_select_own"
on public.student_profiles for select
using (auth.uid() = user_id);

drop policy if exists "student_profiles_insert_own" on public.student_profiles;
create policy "student_profiles_insert_own"
on public.student_profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "student_profiles_update_own" on public.student_profiles;
create policy "student_profiles_update_own"
on public.student_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "question_attempts_select_own" on public.question_attempts;
create policy "question_attempts_select_own"
on public.question_attempts for select
using (auth.uid() = user_id);

drop policy if exists "question_attempts_insert_own" on public.question_attempts;
create policy "question_attempts_insert_own"
on public.question_attempts for insert
with check (auth.uid() = user_id);

drop policy if exists "topic_mastery_select_own" on public.topic_mastery;
create policy "topic_mastery_select_own"
on public.topic_mastery for select
using (auth.uid() = user_id);

drop policy if exists "topic_mastery_insert_own" on public.topic_mastery;
create policy "topic_mastery_insert_own"
on public.topic_mastery for insert
with check (auth.uid() = user_id);

drop policy if exists "topic_mastery_update_own" on public.topic_mastery;
create policy "topic_mastery_update_own"
on public.topic_mastery for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
