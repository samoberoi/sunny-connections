
-- 1. Add columns to cleaners table
ALTER TABLE public.cleaners 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_postcode text;

-- 2. Add replacement_cleaner_id to cleaner_leaves
ALTER TABLE public.cleaner_leaves 
ADD COLUMN IF NOT EXISTS replacement_cleaner_id uuid REFERENCES public.cleaners(id);

-- 3. Add subscription columns to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS subscription_end_date date,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';

-- 4. Create customer_streaks table
CREATE TABLE public.customer_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  month text NOT NULL,
  booking_count integer DEFAULT 0,
  streak_active boolean DEFAULT true,
  free_clean_earned boolean DEFAULT false,
  free_clean_redeemed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, month)
);

ALTER TABLE public.customer_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own streaks"
ON public.customer_streaks FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert own streaks"
ON public.customer_streaks FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own streaks"
ON public.customer_streaks FOR UPDATE
USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all streaks"
ON public.customer_streaks FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all streaks"
ON public.customer_streaks FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Create offers table
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  discount_percent integer NOT NULL,
  code text UNIQUE,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  active boolean DEFAULT true,
  max_claims integer DEFAULT 100,
  claimed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active offers viewable by everyone"
ON public.offers FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage offers"
ON public.offers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Create offer_claims table
CREATE TABLE public.offer_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  claimed_at timestamptz DEFAULT now(),
  redeemed boolean DEFAULT false,
  UNIQUE(offer_id, customer_id)
);

ALTER TABLE public.offer_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own claims"
ON public.offer_claims FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can claim offers"
ON public.offer_claims FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can view all claims"
ON public.offer_claims FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Create cleaner_locations table
CREATE TABLE public.cleaner_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL REFERENCES public.cleaners(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(cleaner_id)
);

ALTER TABLE public.cleaner_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cleaner locations"
ON public.cleaner_locations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Cleaners can upsert own location"
ON public.cleaner_locations FOR ALL
TO authenticated
USING (cleaner_id IN (SELECT id FROM public.cleaners WHERE user_id = auth.uid()));

-- Enable realtime for cleaner_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.cleaner_locations;
