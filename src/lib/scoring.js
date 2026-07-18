// scoring.js — Accountability scoring for parties and politicians.
//
// Two numbers, deliberately kept separate (see Methodology):
//   • Accountability Score (0–100) — weighted across EVERY promise, ranks the
//     leaderboard. Rewards visible progress, penalises overdue and broken.
//   • Resolution Rate (%) — kept / (kept + broken). Ignores unfinished work.
//     Answers "when a promise reaches an outcome, how often is it kept?"
//
// Nothing here hits the network. It runs over the promise rows already loaded
// from promises_full, reading two fields: `status` and `deadline_status`.

// --- Config: tune these as the dataset grows, everything re-tiers itself. ---
export const CONFIDENCE = {
  HIGH: 20,   // >= 20 tracked promises  -> High
  MEDIUM: 8,  // >= 8  tracked promises  -> Medium
  //  < 8                               -> Low / Provisional
};

// Points each promise contributes, on a 0–10 scale.
const POINTS = { kept: 10, in_progress_ontime: 6, in_progress_overdue: 3, broken: 0 };
const MAX_PER_PROMISE = 10;

// Score a single promise row. Returns its 0–10 contribution, or null if the
// row has no scoreable status (defensive — shouldn't happen on clean data).
function pointsFor(row) {
  if (row.status === "kept") return POINTS.kept;
  if (row.status === "broken") return POINTS.broken;
  if (row.status === "in_progress") {
    return row.deadline_status === "missed"
      ? POINTS.in_progress_overdue
      : POINTS.in_progress_ontime;
  }
  return null;
}

// Map a promise count to a confidence tier.
export function confidenceOf(count) {
  if (count >= CONFIDENCE.HIGH) return "high";
  if (count >= CONFIDENCE.MEDIUM) return "medium";
  return "low";
}

// Score an arbitrary list of promise rows. The core of the whole feature.
// Returns null for an empty list (nothing to score).
export function scorePromises(rows) {
  if (!rows || rows.length === 0) return null;

  let earned = 0;
  let scoreable = 0;
  const counts = { kept: 0, broken: 0, in_progress: 0, overdue: 0 };

  for (const r of rows) {
    const pts = pointsFor(r);
    if (pts === null) continue;
    earned += pts;
    scoreable += 1;

    if (r.status === "kept") counts.kept += 1;
    else if (r.status === "broken") counts.broken += 1;
    else if (r.status === "in_progress") {
      counts.in_progress += 1;
      if (r.deadline_status === "missed") counts.overdue += 1;
    }
  }

  if (scoreable === 0) return null;

  const score = Math.round((earned / (scoreable * MAX_PER_PROMISE)) * 100);

  const resolved = counts.kept + counts.broken;
  const resolutionRate = resolved === 0 ? null : Math.round((counts.kept / resolved) * 100);

  return {
    score,                          // 0–100, ranks the board
    resolutionRate,                 // 0–100 or null ("—" when nothing resolved)
    total: scoreable,               // promises actually scored
    counts,                         // { kept, broken, in_progress, overdue }
    confidence: confidenceOf(scoreable),
    provisional: confidenceOf(scoreable) === "low",
  };
}

// Build a ranked party leaderboard from all promise rows.
// Groups by `party` (the full name on the view), carries abbr + colour.
// Sorted by score desc; provisional rows still ranked but flagged so the UI
// can grey them — an honest low-data score can't masquerade as #1.
export function partyLeaderboard(promises) {
  const groups = new Map();
  for (const r of promises) {
    if (!r.party) continue; // party-less rows (null party_id) don't score a party
    if (!groups.has(r.party)) {
      groups.set(r.party, { party: r.party, abbr: r.party_abbr || "", color: r.party_color || "#1E3A5F", rows: [] });
    }
    groups.get(r.party).rows.push(r);
  }

  const board = [];
  for (const g of groups.values()) {
    const s = scorePromises(g.rows);
    if (!s) continue;
    board.push({ party: g.party, abbr: g.abbr, color: g.color, ...s });
  }

  board.sort((a, b) => b.score - a.score);
  return board;
}

// Same, grouped by politician (drill-in). Only rows personally attributed to a
// named politician score them; party-manifesto rows (politician null) don't.
export function politicianLeaderboard(promises) {
  const groups = new Map();
  for (const r of promises) {
    if (!r.politician) continue;
    if (!groups.has(r.politician)) {
      groups.set(r.politician, { politician: r.politician, party: r.party || "", position: r.position || "", color: r.party_color || "#5A6B8C", rows: [] });
    }
    groups.get(r.politician).rows.push(r);
  }

  const board = [];
  for (const g of groups.values()) {
    const s = scorePromises(g.rows);
    if (!s) continue;
    board.push({ politician: g.politician, party: g.party, position: g.position, color: g.color, ...s });
  }

  board.sort((a, b) => b.score - a.score);
  return board;
}
