import { supabase } from '@/integrations/supabase/client';

/**
 * Notify every available, verified cleaner whose specialisations match the
 * booking's service so they get a persistent, deep-linked notification in
 * addition to any real-time popup. Falls back to all available cleaners
 * when none match. Safe to await — never throws to the caller.
 */
export async function notifyMatchingCleanersOfNewBooking(booking: {
  service_name: string;
  customer_name: string;
  date: string;
  time: string;
  address_postcode?: string | null;
}) {
  try {
    const { data: cleaners } = await supabase
      .from('cleaners')
      .select('user_id, specialisations')
      .eq('available', true)
      .eq('verified', true);

    if (!cleaners || cleaners.length === 0) return;

    const sLower = (booking.service_name || '').toLowerCase().trim();
    const matching = cleaners.filter((c) => {
      const specs = c.specialisations || [];
      if (specs.length === 0) return true;
      return specs.some((spec: string) => {
        const specLower = (spec || '').toLowerCase().trim();
        return (
          sLower === specLower ||
          sLower.includes(specLower) ||
          specLower.includes(sLower)
        );
      });
    });

    const targets = (matching.length > 0 ? matching : cleaners).filter(
      (c) => !!c.user_id
    );
    if (targets.length === 0) return;

    const message = `${booking.customer_name} booked ${booking.service_name} on ${booking.date} at ${booking.time}${
      booking.address_postcode ? ` · ${booking.address_postcode}` : ''
    }. Open Jobs to accept.`;

    const rows = targets.map((c) => ({
      user_id: c.user_id as string,
      title: 'New job available',
      message,
      type: 'booking' as const,
    }));

    await supabase.from('notifications').insert(rows);
  } catch (err) {
    // Non-fatal — popup + polling still provide coverage.
    console.error('notifyMatchingCleanersOfNewBooking failed', err);
  }
}
