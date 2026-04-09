
-- S1/H1: Fix notifications INSERT policy to allow cross-user inserts
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- H6: Ensure FK exists for cleaner_leaves joins (add if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cleaner_leaves_cleaner_id_fkey'
  ) THEN
    ALTER TABLE public.cleaner_leaves 
    ADD CONSTRAINT cleaner_leaves_cleaner_id_fkey 
    FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cleaner_leaves_replacement_cleaner_id_fkey'
  ) THEN
    ALTER TABLE public.cleaner_leaves 
    ADD CONSTRAINT cleaner_leaves_replacement_cleaner_id_fkey 
    FOREIGN KEY (replacement_cleaner_id) REFERENCES public.cleaners(id);
  END IF;
END $$;
