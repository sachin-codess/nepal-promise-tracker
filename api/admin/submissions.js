// Moderation queue. SERVER-SIDE ONLY — uses the service key, bypasses RLS.
// GET  ?token=...            -> list pending submissions
// POST { token, id, action } -> action: "approve" | "reject"
//
// Approving resolves politician_name -> politician_id and inserts into `promises`.
// If the politician isn't in the DB yet, we say so and refuse rather than guess.
import { admin, json } from "../_lib/admin.js";

const TOKEN = process.env.ADMIN_TOKEN;

export default async function handler(req, res) {
  if (!admin) return json(res, 500, { error: "Server missing Supabase service credentials." });
  if (!TOKEN) return json(res, 500, { error: "Server missing ADMIN_TOKEN." });

  const token = req.method === "GET" ? req.query.token : req.body?.token;
  if (token !== TOKEN) return json(res, 401, { error: "Unauthorized." });

  if (req.method === "GET") {
    const { data, error } = await admin
      .from("submissions")
      .select("*")
      .eq("review_status", "pending")
      .order("submitted_at", { ascending: true });
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { data });
  }

  if (req.method === "POST") {
    const { id, action } = req.body || {};
    if (!id || !["approve", "reject"].includes(action)) {
      return json(res, 400, { error: "Need an id and action ('approve' or 'reject')." });
    }

    const { data: sub, error: readErr } = await admin
      .from("submissions").select("*").eq("id", id).single();
    if (readErr || !sub) return json(res, 404, { error: "Submission not found." });

    if (action === "reject") {
      const { error } = await admin
        .from("submissions")
        .update({ review_status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { ok: true, action: "rejected", id });
    }

    // approve: resolve the politician by name (case-insensitive)
    const { data: pols, error: polErr } = await admin
      .from("politicians").select("id, name").ilike("name", sub.politician_name.trim());
    if (polErr) return json(res, 500, { error: polErr.message });

    if (!pols || pols.length === 0) {
      return json(res, 409, {
        error: `No politician named "${sub.politician_name}" in the database. Add them first, then approve.`,
      });
    }
    if (pols.length > 1) {
      return json(res, 409, { error: `Ambiguous: multiple politicians match "${sub.politician_name}".` });
    }

    const { error: insErr } = await admin.from("promises").insert([{
      politician_id: pols[0].id,
      promise: sub.promise,
      category: sub.category,
      province: sub.province || "Federal",
      date_made: sub.date_made,
      deadline: sub.deadline,
      source_url: sub.source_url,
      status: "in_progress",   // conservative default, per the methodology
      evidence: sub.notes,
    }]);
    if (insErr) return json(res, 500, { error: insErr.message });

    const { error: updErr } = await admin
      .from("submissions")
      .update({ review_status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (updErr) return json(res, 500, { error: updErr.message });

    return json(res, 200, { ok: true, action: "approved", id, politician_id: pols[0].id });
  }

  return json(res, 405, { error: "Method not allowed." });
}
