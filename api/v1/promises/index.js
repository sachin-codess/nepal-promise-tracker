// GET /api/v1/promises
// Public, read-only. Filters: status, category, politician, party, province.
// Paging: limit (default 50, max 200), offset.

import { db, ok, fail, guard } from "../../_lib/db.js";

export default async function handler(req, res) {
  if (!guard(req, res)) return;

  const { status, category, politician, party, province } = req.query;
  const limit = Math.min(parseInt(req.query.limit ?? "50", 10) || 50, 200);
  const offset = Math.max(parseInt(req.query.offset ?? "0", 10) || 0, 0);

  let q = db
    .from("promises_full")
    .select("*", { count: "exact" })
    .order("date_made", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) q = q.eq("status", status);
  if (category) q = q.eq("category", category);
  if (province) q = q.eq("province", province);
  // Name filters are forgiving — partial, case-insensitive.
  if (politician) q = q.ilike("politician", `%${politician}%`);
  if (party) q = q.or(`party.ilike.%${party}%,party_abbr.ilike.%${party}%`);

  const { data, error, count } = await q;
  if (error) return fail(res, 500, error.message);

  return ok(res, data ?? [], {
    total: count ?? 0,
    limit,
    offset,
    filters: { status, category, politician, party, province },
  });
}
