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

// Fetch national budget rows, optionally for one fiscal year, largest first.
export async function fetchBudget(fiscalYear) {
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 150));
    return { data: [], error: null };
  }
  let query = supabase
    .from("national_budget")
    .select("*")
    .order("amount", { ascending: false });
  if (fiscalYear) query = query.eq("fiscal_year", fiscalYear);
  const { data, error } = await query;
  return { data: data ?? [], error };
}

// Fetch the distinct fiscal years (AD + BS) available, newest first.
export async function fetchBudgetYears() {
  if (!supabase) return { data: [], error: null };
  const { data, error } = await supabase
    .from("national_budget")
    .select("fiscal_year, fiscal_year_bs");
  if (error) return { data: [], error };
  const seen = new Map();
  for (const r of data ?? []) {
    if (!seen.has(r.fiscal_year)) seen.set(r.fiscal_year, r.fiscal_year_bs);
  }
  const years = [...seen.entries()]
    .map(([ad, bs]) => ({ ad, bs }))
    .sort((a, b) => b.ad.localeCompare(a.ad));
  return { data: years, error: null };
}


// Fetch mega-projects: long-running national infrastructure that outlives
// the politicians who promised it. Newest start date first.
export async function fetchProjects() {
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 150));
    return { data: [], error: null };
  }
  const { data, error } = await supabase
    .from("mega_projects")
    .select("*")
    .order("start_date", { ascending: false });
  return { data: data ?? [], error };
}

// Fetch project milestones - the slippage record. Pass a projectId for one
// project's chain, or call with no argument to load all at once.
export async function fetchMilestones(projectId) {
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 150));
    return { data: [], error: null };
  }
  let query = supabase
    .from("project_milestones")
    .select("*")
    .order("event_date", { ascending: true });
  if (projectId != null) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  return { data: data ?? [], error };
}
