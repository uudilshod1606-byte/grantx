-- Admin account migration: move INTIL admin authorization to uudilshod1606@gmail.com

CREATE OR REPLACE FUNCTION public.is_intil_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = 'uudilshod1606@gmail.com'
$$;

DROP POLICY IF EXISTS "question_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "question_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "question_images_admin_delete" ON storage.objects;

CREATE POLICY "question_images_admin_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'question-images'
  AND lower(coalesce(auth.jwt() ->> 'email','')) = 'uudilshod1606@gmail.com'
);

CREATE POLICY "question_images_admin_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'question-images'
  AND lower(coalesce(auth.jwt() ->> 'email','')) = 'uudilshod1606@gmail.com'
)
WITH CHECK (
  bucket_id = 'question-images'
  AND lower(coalesce(auth.jwt() ->> 'email','')) = 'uudilshod1606@gmail.com'
);

CREATE POLICY "question_images_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'question-images'
  AND lower(coalesce(auth.jwt() ->> 'email','')) = 'uudilshod1606@gmail.com'
);
