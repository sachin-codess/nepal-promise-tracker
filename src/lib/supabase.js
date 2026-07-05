// Data layer: talks to Supabase when configured, falls back to demo data when not.
// This means the app runs instantly out of the box, and upgrades itself the
// moment you add real keys to a .env file. See README for setup.

import { createClient } from "@supabase/supabase-js";
import { DEMO_PROMISES } from "../data/demoData";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create a real client if both keys exist and look filled-in.
const configured =
  url && key && url.startsWith("http") && !url.includes("your-project");

export const supabase = configured ? createClient(url, key) : null;
export const isLiveDatabase = configured;

// One function the app calls; it doesn't care where the data comes from.
export async function fetchPromises() {
  if (!supabase) {
    // Demo mode: pretend it took a moment, like a real network call.
    await new Promise((r) => setTimeout(r, 300));
    return { data: DEMO_PROMISES, error: null, live: false };
  }
  const { data, error } = await supabase
    .from("promises_full")
    .select("*")
    .order("date_made", { ascending: false });
  return { data: data ?? [], error, live: true };
}

// Fetch evidence events. Pass a promiseId for one promise's chain,
// or call with no argument to load all events at once.
export async function fetchEvents(promiseId) {
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 150));
    return { data: [], error: null };
  }
  let query = supabase
    .from("evidence_events")
    .select("*")
    .order("event_date", { ascending: true });
  if (promiseId != null) query = query.eq("promise_id", promiseId);
  const { data, error } = await query;
  return { data: data ?? [], error };
}
