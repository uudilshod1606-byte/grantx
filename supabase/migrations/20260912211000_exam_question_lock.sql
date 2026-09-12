alter table public.exam_attempts
  add column if not exists question_ids jsonb not null default '[]'::jsonb;

create index if not exists exam_attempts_exam_key_idx
  on public.exam_attempts(exam_key, created_at desc);
