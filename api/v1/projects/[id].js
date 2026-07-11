// GET /api/v1/projects/:id
// One project with its full milestone chain — the delay record.

import { db, ok, fail, guard } from "../../_lib/db.js";

function yearsSlipped(original, current) {
  if (!original || !current) return null;
  const ms = new Date(current) - new Date(original);
  if (ms <= 0) return 0;
  return Math.round((ms / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10;
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

  return ok(res, {
    ...project,
    years_slipped: yearsSlipped(project.original_deadline, project.current_deadline),
    milestones: milestones ?? [],
  });
}
