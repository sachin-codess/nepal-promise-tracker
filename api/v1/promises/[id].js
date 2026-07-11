// GET /api/v1/promises/:id
// One promise, with its full evidence timeline attached. This is the
// endpoint that lets someone cite a status AND show why.

import { db, ok, fail, guard } from "../../_lib/db.js";

export default async function handler(req, res) {
  if (!guard(req, res)) return;

  const id = parseInt(req.query.id, 10);
  if (!Number.isInteger(id)) return fail(res, 400, "Invalid promise id.");

  const { data: promise, error } = await db
    .from("promises_full")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(res, 500, error.message);
  if (!promise) return fail(res, 404, `No promise with id ${id}.`);

  const { data: events } = await db
    .from("evidence_events")
    .select("*")
    .eq("promise_id", id)
    .order("event_date", { ascending: true });

  return ok(res, { ...promise, evidence_events: events ?? [] });
}
