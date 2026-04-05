CREATE POLICY "Authenticated users can insert own cleaner record"
ON public.cleaners FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);