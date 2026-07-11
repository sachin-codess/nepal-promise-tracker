// Server-side Supabase client for the public API routes.
// Separate from src/lib/supabase.js because serverless uses process.env,
// not import.meta.env. Read-only anon key — same public data the site shows.

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const db = url && key ? createClient(url, key) : null;

export const LICENSE = "CC BY 4.0";
export const ATTRIBUTION = "vaacha (Nepal Promise Tracker)";
export const METHODOLOGY = "https://nepal-promise-tracker.vercel.app/?about";

// Every response goes through here: CORS open, cached at the edge,
// and always carrying the license + methodology so the data can be cited.
export function send(res, status, body) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  // Cache 5 min at the edge, serve stale for an hour while revalidating.
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  return res.status(status).json(body);
}

export function ok(res, data, extra = {}) {
  return send(res, 200, {
    meta: {
      count: Array.isArray(data) ? data.length : 1,
      license: LICENSE,
      attribution: ATTRIBUTION,
      methodology: METHODOLOGY,
      generated_at: new Date().toISOString(),
      ...extra,
    },
    data,
  });
}

export function fail(res, status, message) {
  return send(res, status, { error: message });
}

// Shared guard: only GET, and the DB must be configured.
export function guard(req, res) {
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return false;
  }
  if (req.method !== "GET") {
    fail(res, 405, "Method not allowed. This API is read-only.");
    return false;
  }
  if (!db) {
    fail(res, 500, "Server is missing Supabase credentials.");
    return false;
  }
  return true;
}
