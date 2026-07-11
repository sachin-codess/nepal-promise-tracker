// GET /api/v1/projects
// Mega-projects. Each carries the slippage numbers: original_deadline vs
// current_deadline, plus years_slipped computed server-side so consumers
// don't have to derive it themselves.

import { db, ok, fail, guard } from "../../_lib/db.js";

function yearsSlipped(original, current) {
  if (!original || !current) return null;
  const ms = new Date(current) - new Date(original);
  if (ms <= 0) return 0;
  return Math.round((ms / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10;
}

export default async function handler(req, res) {
  if (!guard(req, res)) return;

  const { status } = req.query;

  let q = db
    .from("mega_projects")
    .select("*", { count: "exact" })
    .order("start_date", { ascending: false });

  if (status) q = q.eq("status", status);

  const { data, error, count } = await q;
  if (error) return fail(res, 500, error.message);

  const enriched = (data ?? []).map((p) => ({
    ...p,
    years_slipped: yearsSlipped(p.original_deadline, p.current_deadline),
  }));

  return ok(res, enriched, { total: count ?? 0, filters: { status } });
}
