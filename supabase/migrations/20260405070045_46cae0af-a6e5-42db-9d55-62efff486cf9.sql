
-- Create messages table for customer-cleaner chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Customers can read/write messages on their own bookings
CREATE POLICY "Users can view messages on their bookings"
ON public.messages FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = messages.booking_id AND (bookings.customer_id = auth.uid() OR bookings.cleaner_id IN (SELECT cleaners.id FROM cleaners WHERE cleaners.user_id = auth.uid())))
);

CREATE POLICY "Users can send messages on their bookings"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = messages.booking_id AND (bookings.customer_id = auth.uid() OR bookings.cleaner_id IN (SELECT cleaners.id FROM cleaners WHERE cleaners.user_id = auth.uid())))
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
