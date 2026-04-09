ALTER TABLE public.services ADD COLUMN IF NOT EXISTS service_mode text NOT NULL DEFAULT 'both';
ALTER TABLE public.cleaners ADD COLUMN IF NOT EXISTS service_modes text[] NOT NULL DEFAULT '{}';