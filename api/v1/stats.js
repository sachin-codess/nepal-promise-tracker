// GET /api/v1/stats
// Everything a dashboard needs in one call: totals and breakdowns.

import { db, ok, fail, guard } from "../_lib/db.js";

function tally(rows, field) {
  const out = {};
  for (const r of rows) {
    const k = r[field];
    if (k == null) continue;
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export default async function handler(req, res) {
  if (!guard(req, res)) return;

  const { data: promises, error } = await db
    .from("promises_full")
    .select("status, category, party, politician, province");
  if (error) return fail(res, 500, error.message);

  const { data: projects } = await db
    .from("mega_projects")
    .select("status, original_deadline, current_deadline, budget_original, budget_allocated");

  const rows = promises ?? [];
  const projRows = projects ?? [];

  // Total years of deadline slippage across all tracked mega-projects.
  let slipTotal = 0;
  // Total cost overrun (NPR) across projects with a known original estimate.
  let overrunTotal = 0;
  for (const p of projRows) {
    if (p.original_deadline && p.current_deadline) {
      const ms = new Date(p.current_deadline) - new Date(p.original_deadline);
      if (ms > 0) slipTotal += ms / (1000 * 60 * 60 * 24 * 365.25);
    }
    if (p.budget_original != null && p.budget_allocated != null) {
      const over = Number(p.budget_allocated) - Number(p.budget_original);
      if (over > 0) overrunTotal += over;
    }
  }

  return ok(res, {
    promises: {
      total: rows.length,
      by_status: tally(rows, "status"),
      by_category: tally(rows, "category"),
      by_party: tally(rows, "party"),
      by_province: tally(rows, "province"),
    },
    politicians_tracked: new Set(rows.map((r) => r.politician).filter(Boolean)).size,
    parties_tracked: new Set(rows.map((r) => r.party).filter(Boolean)).size,
    projects: {
      total: projRows.length,
      by_status: tally(projRows, "status"),
      total_years_slipped: Math.round(slipTotal * 10) / 10,
      total_cost_overrun_npr: overrunTotal,
    },
  });
}
