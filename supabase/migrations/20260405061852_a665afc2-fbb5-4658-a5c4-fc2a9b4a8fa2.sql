CREATE POLICY "Cleaners can view pending bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (
  (cleaner_id IS NULL AND status = 'pending' AND EXISTS (
    SELECT 1 FROM cleaners WHERE cleaners.user_id = auth.uid()
  ))
);