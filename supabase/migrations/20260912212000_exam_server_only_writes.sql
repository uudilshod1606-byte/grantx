-- Exam attempts and answers are server-owned state.
-- Students may read their own attempts, but cannot forge deadlines,
-- question sets, scores, or answer rows directly from the browser.

drop policy if exists "exam_attempts_insert_own" on public.exam_attempts;
drop policy if exists "exam_attempts_update_own" on public.exam_attempts;
drop policy if exists "exam_answers_insert_own" on public.exam_answers;
drop policy if exists "exam_answers_update_own" on public.exam_answers;

-- service_role used by the Edge Functions bypasses RLS and remains able to
-- create/update attempts and persist submitted answers.
