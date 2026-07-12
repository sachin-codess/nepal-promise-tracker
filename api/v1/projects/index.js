// GET /api/v1/projects
// Mega-projects. Each carries the slippage numbers: original_deadline vs
// current_deadline, plus years_slipped computed server-side so consumers
// don't have to derive it themselves. Same for cost: budget_original vs
// budget_allocated, plus cost_overrun_npr and cost_overrun_pct.

import { db, ok, fail, guard } from "../../_lib/db.js";

function yearsSlipped(original, current) {
  if (!original || !current) return null;
  const ms = new Date(current) - new Date(original);
  if (ms <= 0) return 0;
  return Math.round((ms / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10;
}

// null (not 0) when there is no approved original estimate to overrun from —
// a quashed project has no baseline, and null lets the UI hide the bar.
function costOverrun(original, allocated) {
  if (original == null || allocated == null) return { npr: null, pct: null };
  const npr = Number(allocated) - Number(original);
  if (npr <= 0) return { npr: 0, pct: 0 };
  return {
    npr,
    pct: Math.round((npr / Number(original)) * 1000) / 10,
  };
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

  const enriched = (data ?? []).map((p) => {
    const over = costOverrun(p.budget_original, p.budget_allocated);
    return {
      ...p,
      years_slipped: yearsSlipped(p.original_deadline, p.current_deadline),
      cost_overrun_npr: over.npr,
      cost_overrun_pct: over.pct,
    };
  });

  return ok(res, enriched, { total: count ?? 0, filters: { status } });
}
