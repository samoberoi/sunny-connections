
-- Storage bucket for job photos
INSERT INTO storage.buckets (id, name, public) VALUES ('job-photos', 'job-photos', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view job photos" ON storage.objects FOR SELECT USING (bucket_id = 'job-photos');
CREATE POLICY "Authenticated users can upload job photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job-photos' AND auth.role() = 'authenticated');

-- Job photos table
CREATE TABLE public.job_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after')),
  photo_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view photos for own bookings" ON public.job_photos FOR SELECT
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = job_photos.booking_id AND bookings.customer_id = auth.uid()));

CREATE POLICY "Cleaners can insert photos for assigned bookings" ON public.job_photos FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by AND EXISTS (
    SELECT 1 FROM bookings b JOIN cleaners c ON b.cleaner_id = c.id WHERE b.id = job_photos.booking_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Cleaners can view photos they uploaded" ON public.job_photos FOR SELECT
  USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can view all job photos" ON public.job_photos FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Customer coins wallet
CREATE TABLE public.customer_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own coins" ON public.customer_coins FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can insert own coins" ON public.customer_coins FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own coins" ON public.customer_coins FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Admins can view all coins" ON public.customer_coins FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage all coins" ON public.customer_coins FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Coin transactions
CREATE TABLE public.coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent')),
  description TEXT,
  booking_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can insert own transactions" ON public.coin_transactions FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can view all transactions" ON public.coin_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage all transactions" ON public.coin_transactions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add payment_method and referral_code to bookings
ALTER TABLE public.bookings ADD COLUMN payment_method TEXT DEFAULT 'card';
ALTER TABLE public.bookings ADD COLUMN referral_code TEXT;
