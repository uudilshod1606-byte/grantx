CREATE TABLE public.written_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL DEFAULT '',
  user_name TEXT NOT NULL DEFAULT '',
  attempt_id UUID NOT NULL,
  subject_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  exam_label TEXT,
  submission_kind TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL DEFAULT '',
  answer_text TEXT NOT NULL DEFAULT '',
  max_points NUMERIC NOT NULL DEFAULT 0,
  ai_suggestion JSONB,
  approved_criteria JSONB,
  approved_score NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  test_raw NUMERIC NOT NULL DEFAULT 0,
  test_max NUMERIC NOT NULL DEFAULT 0,
  scoring_method TEXT NOT NULL DEFAULT 'B',
  final_score NUMERIC,
  final_grade TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.written_submissions TO authenticated;
GRANT ALL ON public.written_submissions TO service_role;

ALTER TABLE public.written_submissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_intil_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = 'dilshoduktamov34@gmail.com'
$$;

CREATE POLICY "Students insert own written submissions"
ON public.written_submissions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students read own written submissions"
ON public.written_submissions FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_intil_admin());

CREATE POLICY "Admin updates written submissions"
ON public.written_submissions FOR UPDATE TO authenticated
USING (public.is_intil_admin())
WITH CHECK (public.is_intil_admin());

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_written_submissions_updated_at
BEFORE UPDATE ON public.written_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX written_submissions_status_idx ON public.written_submissions (status, created_at DESC);
CREATE INDEX written_submissions_user_idx ON public.written_submissions (user_id, created_at DESC);