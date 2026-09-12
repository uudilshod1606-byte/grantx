-- INTIL exam security hardening
-- Server-owned attempt state and a public question projection.
-- This migration deliberately does NOT remove access to the legacy questions table yet;
-- the frontend must be switched to questions_public before that final lock-down.

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_key text not null,
  exam_title text not null,
  kind text not null check (kind in ('dtm', 'milliy', 'bank')),
  subject_ids jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  status text not null default 'active' check (status in ('active', 'submitted', 'expired')),
  total integer not null default 0 check (total >= 0),
  correct integer not null default 0 check (correct >= 0),
  incorrect integer not null default 0 check (incorrect >= 0),
  unanswered integer not null default 0 check (unanswered >= 0),
  percent numeric(6,2) not null default 0 check (percent >= 0 and percent <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_attempts_user_idx on public.exam_attempts(user_id, created_at desc);
create index if not exists exam_attempts_status_idx on public.exam_attempts(status, expires_at);

alter table public.exam_attempts enable row level security;

 drop policy if exists "exam_attempts_select_own" on public.exam_attempts;
create policy "exam_attempts_select_own"
  on public.exam_attempts for select to authenticated
  using (auth.uid() = user_id);

 drop policy if exists "exam_attempts_insert_own" on public.exam_attempts;
create policy "exam_attempts_insert_own"
  on public.exam_attempts for insert to authenticated
  with check (auth.uid() = user_id);

 drop policy if exists "exam_attempts_update_own" on public.exam_attempts;
create policy "exam_attempts_update_own"
  on public.exam_attempts for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.exam_answers (
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null,
  answer_index integer,
  answer_text text,
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create index if not exists exam_answers_question_idx on public.exam_answers(question_id);

alter table public.exam_answers enable row level security;

 drop policy if exists "exam_answers_select_own" on public.exam_answers;
create policy "exam_answers_select_own"
  on public.exam_answers for select to authenticated
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = exam_answers.attempt_id
        and a.user_id = auth.uid()
    )
  );

 drop policy if exists "exam_answers_insert_own" on public.exam_answers;
create policy "exam_answers_insert_own"
  on public.exam_answers for insert to authenticated
  with check (
    exists (
      select 1 from public.exam_attempts a
      where a.id = exam_answers.attempt_id
        and a.user_id = auth.uid()
        and a.status = 'active'
        and a.expires_at > now()
    )
  );

 drop policy if exists "exam_answers_update_own" on public.exam_answers;
create policy "exam_answers_update_own"
  on public.exam_answers for update to authenticated
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = exam_answers.attempt_id
        and a.user_id = auth.uid()
        and a.status = 'active'
        and a.expires_at > now()
    )
  )
  with check (
    exists (
      select 1 from public.exam_attempts a
      where a.id = exam_answers.attempt_id
        and a.user_id = auth.uid()
        and a.status = 'active'
        and a.expires_at > now()
    )
  );

-- Never expose answer keys, explanations, solutions or other scoring fields
-- through the student-facing question projection.
create or replace view public.questions_public
with (security_invoker = true)
as
select
  id,
  subject_id,
  kind,
  block,
  category,
  difficulty,
  points,
  image_url,
  text,
  question_type,
  options,
  passage_text,
  exam_category,
  exam_label,
  group_id,
  group_intro,
  created_at,
  updated_at
from public.questions;

grant select on public.questions_public to authenticated;

comment on view public.questions_public is
  'Student-safe question projection. Never add correct_index, answer_text, explanation, or solution here.';
