
-- Add onboarding and property columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS bedrooms integer,
ADD COLUMN IF NOT EXISTS bathrooms integer,
ADD COLUMN IF NOT EXISTS property_size text,
ADD COLUMN IF NOT EXISTS preferred_day text,
ADD COLUMN IF NOT EXISTS pet_info text,
ADD COLUMN IF NOT EXISTS budget_preference text DEFAULT 'standard';

-- Add tier and property details to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS tier text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS bedrooms integer,
ADD COLUMN IF NOT EXISTS bathrooms integer;

-- Create cleaner_leaves table
CREATE TABLE public.cleaner_leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaners(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cleaner_leaves ENABLE ROW LEVEL SECURITY;

-- Cleaners can manage own leaves
CREATE POLICY "Cleaners can view own leaves" ON public.cleaner_leaves
  FOR SELECT TO authenticated
  USING (cleaner_id IN (SELECT id FROM public.cleaners WHERE user_id = auth.uid()));

CREATE POLICY "Cleaners can request leaves" ON public.cleaner_leaves
  FOR INSERT TO authenticated
  WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaners WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all leaves" ON public.cleaner_leaves
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create cleaner_availability table
CREATE TABLE public.cleaner_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaners(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '17:00',
  available boolean NOT NULL DEFAULT true
);
ALTER TABLE public.cleaner_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cleaners can manage own availability" ON public.cleaner_availability
  FOR ALL TO authenticated
  USING (cleaner_id IN (SELECT id FROM public.cleaners WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view availability" ON public.cleaner_availability
  FOR SELECT TO authenticated
  USING (true);

-- Create favourite_cleaners table
CREATE TABLE public.favourite_cleaners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  cleaner_id uuid NOT NULL REFERENCES public.cleaners(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(customer_id, cleaner_id)
);
ALTER TABLE public.favourite_cleaners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favourites" ON public.favourite_cleaners
  FOR ALL TO authenticated
  USING (customer_id = auth.uid());

-- Allow authenticated users to insert notifications
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Enable realtime for cleaner_leaves
ALTER PUBLICATION supabase_realtime ADD TABLE public.cleaner_leaves;
