// GET /api/v1/projects/:id
// One project with its full milestone chain — the delay record, and the cost record.

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

  const id = parseInt(req.query.id, 10);
  if (!Number.isInteger(id)) return fail(res, 400, "Invalid project id.");

  const { data: project, error } = await db
    .from("mega_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(res, 500, error.message);
  if (!project) return fail(res, 404, `No project with id ${id}.`);

  const { data: milestones } = await db
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("event_date", { ascending: true });

  const over = costOverrun(project.budget_original, project.budget_allocated);

  return ok(res, {
    ...project,
    years_slipped: yearsSlipped(project.original_deadline, project.current_deadline),
    cost_overrun_npr: over.npr,
    cost_overrun_pct: over.pct,
    milestones: milestones ?? [],
  });
}
