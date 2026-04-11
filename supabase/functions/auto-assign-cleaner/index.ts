import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Calculate distance between two lat/lng points in km (Haversine) */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Simple postcode-based lat/lng approximation for London postcodes */
function postcodeToApproxLatLng(postcode: string): { lat: number; lng: number } | null {
  // Default London center if we can't parse
  const pc = (postcode || "").toUpperCase().replace(/\s+/g, "");
  // Use a rough London center as fallback
  return { lat: 51.5074, lng: -0.1278 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find pending bookings older than 3 minutes with no cleaner assigned
    const threeMinAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();

    const { data: pendingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending")
      .is("cleaner_id", null)
      .lt("created_at", threeMinAgo)
      .order("created_at", { ascending: true })
      .limit(10);

    if (bookingsError) throw bookingsError;
    if (!pendingBookings || pendingBookings.length === 0) {
      return new Response(JSON.stringify({ message: "No pending bookings to assign", assigned: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all available cleaners with their locations
    const { data: availableCleaners, error: cleanersError } = await supabase
      .from("cleaners")
      .select("id, name, user_id, specialisations, available, address_postcode")
      .eq("available", true)
      .eq("verified", true);

    if (cleanersError) throw cleanersError;
    if (!availableCleaners || availableCleaners.length === 0) {
      return new Response(JSON.stringify({ message: "No available cleaners", assigned: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get cleaner locations
    const cleanerIds = availableCleaners.map((c) => c.id);
    const { data: locations } = await supabase
      .from("cleaner_locations")
      .select("cleaner_id, latitude, longitude")
      .in("cleaner_id", cleanerIds);

    const locationMap = new Map<string, { lat: number; lng: number }>();
    (locations || []).forEach((l: any) => {
      locationMap.set(l.cleaner_id, { lat: l.latitude, lng: l.longitude });
    });

    // Get current assigned job counts for each cleaner (to prefer less busy cleaners)
    const { data: activeBookings } = await supabase
      .from("bookings")
      .select("cleaner_id")
      .in("cleaner_id", cleanerIds)
      .in("status", ["assigned", "en-route", "otp-verified", "in-progress"]);

    const jobCounts = new Map<string, number>();
    (activeBookings || []).forEach((b: any) => {
      jobCounts.set(b.cleaner_id, (jobCounts.get(b.cleaner_id) || 0) + 1);
    });

    let assignedCount = 0;

    for (const booking of pendingBookings) {
      const bookingPostcode = booking.address_postcode || "";
      const bookingCoords = postcodeToApproxLatLng(bookingPostcode);

      // Filter cleaners by specialisation match
      const matchingCleaners = availableCleaners.filter((c) => {
        const specs = c.specialisations || [];
        if (specs.length === 0) return true;
        const sLower = (booking.service_name || "").toLowerCase().trim();
        return specs.some((spec: string) => {
          const specLower = spec.toLowerCase().trim();
          return sLower === specLower || sLower.includes(specLower) || specLower.includes(sLower);
        });
      });

      if (matchingCleaners.length === 0) continue;

      // Score each cleaner: lower is better
      // Score = distance_km * 1 + active_jobs * 5
      const scored = matchingCleaners.map((c) => {
        const loc = locationMap.get(c.id);
        let distance = 999;
        if (loc && bookingCoords) {
          distance = haversineKm(bookingCoords.lat, bookingCoords.lng, loc.lat, loc.lng);
        } else if (c.address_postcode && bookingPostcode) {
          // Postcode prefix match heuristic
          const cPrefix = c.address_postcode.replace(/\s+/g, "").slice(0, 3).toUpperCase();
          const bPrefix = bookingPostcode.replace(/\s+/g, "").slice(0, 3).toUpperCase();
          distance = cPrefix === bPrefix ? 2 : 15;
        }
        const jobs = jobCounts.get(c.id) || 0;
        return { cleaner: c, score: distance + jobs * 5 };
      });

      scored.sort((a, b) => a.score - b.score);
      const best = scored[0];
      if (!best) continue;

      // Assign the booking
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          cleaner_id: best.cleaner.id,
          cleaner_name: best.cleaner.name,
          status: "assigned",
        })
        .eq("id", booking.id)
        .eq("status", "pending"); // ensure it's still pending

      if (updateError) {
        console.error(`Failed to assign booking ${booking.id}:`, updateError);
        continue;
      }

      // Notify customer
      if (booking.customer_id) {
        await supabase.from("notifications").insert({
          user_id: booking.customer_id,
          title: "Cleaner Assigned!",
          message: `${best.cleaner.name} has been auto-assigned to your ${booking.service_name} booking.`,
          type: "booking",
        });
      }

      // Notify cleaner
      if (best.cleaner.user_id) {
        await supabase.from("notifications").insert({
          user_id: best.cleaner.user_id,
          title: "New Job Auto-Assigned",
          message: `You've been assigned a ${booking.service_name} job for ${booking.customer_name} on ${booking.date} at ${booking.time}.`,
          type: "booking",
        });
      }

      // Auto-assign recurring siblings too
      if (booking.recurring && booking.recurring !== "none") {
        const { data: siblings } = await supabase
          .from("bookings")
          .select("id")
          .eq("customer_id", booking.customer_id)
          .eq("service_name", booking.service_name)
          .eq("recurring", booking.recurring)
          .eq("status", "pending")
          .is("cleaner_id", null)
          .neq("id", booking.id);

        if (siblings && siblings.length > 0) {
          await supabase
            .from("bookings")
            .update({
              cleaner_id: best.cleaner.id,
              cleaner_name: best.cleaner.name,
              status: "assigned",
            })
            .in("id", siblings.map((s) => s.id));
        }
      }

      assignedCount++;
      // Remove this cleaner from the pool for subsequent bookings
      jobCounts.set(best.cleaner.id, (jobCounts.get(best.cleaner.id) || 0) + 1);
    }

    return new Response(
      JSON.stringify({ message: `Auto-assigned ${assignedCount} booking(s)`, assigned: assignedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-assign error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
