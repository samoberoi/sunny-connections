
-- C5: Add unique constraint on addresses(user_id, label)
ALTER TABLE public.addresses ADD CONSTRAINT addresses_user_id_label_unique UNIQUE (user_id, label);

-- S1: Tighten notifications INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
