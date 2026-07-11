// Service-key Supabase client. Bypasses RLS — SERVER-SIDE ONLY.
// Deliberately separate from _lib/db.js (anon, read-only, public API) so the
// public routes can never accidentally inherit admin powers.
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

export const admin = url && key ? createClient(url, key) : null;

export function json(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}
