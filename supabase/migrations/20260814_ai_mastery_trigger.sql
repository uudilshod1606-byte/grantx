-- INTIL AI foundation, stage 1.5:
-- Every persisted question attempt automatically updates the student's topic mastery.
-- The frontend only needs to insert question_attempts; the database keeps mastery consistent.

create or replace function public.update_topic_mastery_from_attempt()
returns trigger
language plpgsql
security invoker
as $$
declare
  v_topic text;
  v_seen integer;
  v_correct integer;
  v_score numeric;
  v_avg numeric;
begin
  v_topic := coalesce(nullif(trim(new.category), ''), 'Umumiy');

  select
    count(*)::integer,
    count(*) filter (where is_correct)::integer,
    avg(time_spent_seconds)::numeric
  into v_seen, v_correct, v_avg
  from public.question_attempts
  where user_id = new.user_id
    and subject_id = new.subject_id
    and coalesce(nullif(trim(category), ''), 'Umumiy') = v_topic;

  v_score := case
    when v_seen = 0 then 0
    else round((v_correct::numeric / v_seen::numeric) * 100, 2)
  end;

  insert into public.topic_mastery (
    user_id,
    subject_id,
    topic,
    mastery_score,
    questions_seen,
    questions_correct,
    average_time_seconds,
    last_practiced_at,
    updated_at
  ) values (
    new.user_id,
    new.subject_id,
    v_topic,
    v_score,
    v_seen,
    v_correct,
    v_avg,
    new.created_at,
    now()
  )
  on conflict (user_id, subject_id, topic)
  do update set
    mastery_score = excluded.mastery_score,
    questions_seen = excluded.questions_seen,
    questions_correct = excluded.questions_correct,
    average_time_seconds = excluded.average_time_seconds,
    last_practiced_at = excluded.last_practiced_at,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists question_attempts_update_topic_mastery on public.question_attempts;
create trigger question_attempts_update_topic_mastery
after insert on public.question_attempts
for each row execute function public.update_topic_mastery_from_attempt();
