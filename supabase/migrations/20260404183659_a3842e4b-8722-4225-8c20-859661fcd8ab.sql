
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS property_type text NOT NULL DEFAULT 'house';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS notes text;

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

CREATE POLICY "Cleaners can view assigned bookings" ON public.bookings FOR SELECT TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaners WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can update assigned bookings" ON public.bookings FOR UPDATE TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaners WHERE user_id = auth.uid()));
CREATE POLICY "Cleaners can accept unassigned bookings" ON public.bookings FOR UPDATE TO authenticated USING (cleaner_id IS NULL AND EXISTS (SELECT 1 FROM public.cleaners WHERE user_id = auth.uid()));
