-- Final exam write lock-down.
-- Attempts and answers are server-owned; clients may read only their own state.

drop policy if exists exam_attempts_insert_own on public.exam_attempts;
drop policy if exists exam_attempts_update_own on public.exam_attempts;
drop policy if exists exam_answers_insert_own on public.exam_answers;
drop policy if exists exam_answers_update_own on public.exam_answers;

alter function public.set_updated_at() set search_path = public;
alter function public.update_topic_mastery_from_attempt() set search_path = public;

revoke execute on function public.is_intil_admin() from anon, authenticated;
revoke execute on function public.rls_auto_enable() from anon, authenticated;
