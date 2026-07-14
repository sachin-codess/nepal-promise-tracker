// AI assistant over the promise database.
// POST { messages, lang } -> SSE stream. `messages` is the visible chat so
// far ([{ role, content }...], ending with the newest user question), which
// gives the model conversation memory for follow-ups ("what about NC?").
// Legacy { question, lang } is still accepted.
//
// NOT part of the public read-only API: this takes POST, and its answers
// must never be edge-cached. It reuses the `db` client from _lib/db.js but
// deliberately not send/ok/guard (those enforce GET + a 5-min cache).
//
// Retrieval = SQL against our own tables. No vectors: the corpus is small,
// and the questions people actually ask ("who broke the most promises?")
// are aggregations, which similarity search gets wrong.

import { db } from "./_lib/db.js";

const MODEL = "claude-sonnet-4-6";

const TOOLS = [
  {
    name: "search_promises",
    description:
      "Search and filter political promises. Use for any question about what was promised, by whom, and whether it was kept. Omit filters to browse broadly. Returns promise id, text, politician, party, status, category, province, dates, and evidence.",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["kept", "broken", "in_progress"],
          description: "Filter by fulfilment status.",
        },
        category: { type: "string", description: "e.g. Education, Health, Anti-corruption, Governance, Transport." },
        politician: { type: "string", description: "Politician name, partial match allowed." },
        party: { type: "string", description: "Party name or abbreviation, e.g. NC, CPN-UML, RSP." },
        province: { type: "string", description: "Province name, or 'Federal' for national promises." },
        query: { type: "string", description: "Free-text keyword to match inside the promise text." },
        deadline_status: {
          type: "string",
          enum: ["met", "missed", "not_due", "none"],
          description: "Whether a promise's DEADLINE has passed — separate from whether it was kept. 'missed' = the deadline elapsed and the promise is not yet fulfilled. A missed deadline is NOT the same as a broken promise: work may be underway. Use this for questions like 'has the government missed any deadlines?'",
        },
        election_cycle: {
          type: "string",
          description: "Which election's manifesto a promise came from, e.g. '2022 General Election' or '2026 General Election'. Use this to compare manifestos across cycles, or to find promises a party repeated after failing them. Omit for promises made outside an election (ministerial announcements, mayoral pledges, government commitment papers).",
        },
      },
    },
  },
  {
    name: "compare_parties",
    description:
      "Break down promises by party AND status in a single call, with promise ids for citation. Use this for any party-vs-party comparison ('who kept more?', 'compare NC and UML') instead of running one search per party. Returns, per party: a total plus the id, politician, and short text of every kept, broken, and in_progress promise. Pass `parties` to narrow, or omit it to get all parties.",
    input_schema: {
      type: "object",
      properties: {
        parties: {
          type: "array",
          items: { type: "string" },
          description: 'Party names or abbreviations to include, e.g. ["NC", "CPN-UML"]. Omit for all parties.',
        },
      },
    },
  },
  {
    name: "get_stats",
    description:
      "Get aggregate counts across the whole database: promises by status, by party, by category, plus mega-project totals (years slipped, cost overrun). Use this for 'how many', 'which party has the most', 'compare X and Y' questions.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_projects",
    description:
      "Get ALL mega-projects with deadline slippage, cost overrun, and full milestone history. Returns every project (there are only a few), so call this for any infrastructure or project question and pick the relevant one from the result. Do not assume a project is absent without calling this first.",
    input_schema: { type: "object", properties: {} },
  },
];

async function searchPromises(a = {}) {
  let q = db.from("promises_full").select("*").limit(60);
  if (a.status) q = q.eq("status", a.status);
  if (a.category) q = q.ilike("category", `%${a.category}%`);
  // Every word must appear, in any order: "KP Oli" matches "KP Sharma Oli".
  if (a.politician)
    for (const w of a.politician.trim().split(/\s+/)) q = q.ilike("politician", `%${w}%`);
  if (a.party) q = q.or(`party.ilike.%${a.party}%,party_abbr.ilike.%${a.party}%`);
  if (a.province) q = q.ilike("province", `%${a.province}%`);
  if (a.query) q = q.ilike("promise", `%${a.query}%`);
  if (a.election_cycle) q = q.ilike("election_cycle", `%${a.election_cycle}%`);
  if (a.deadline_status) q = q.eq("deadline_status", a.deadline_status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

async function compareParties(a = {}) {
  const { data, error } = await db
    .from("promises_full")
    .select("id,promise,politician,party,party_abbr,status");
  if (error) throw new Error(error.message);

  const wanted = (Array.isArray(a.parties) ? a.parties : []).map((p) => String(p).toLowerCase());
  const match = (r) =>
    !wanted.length ||
    wanted.some(
      (w) =>
        (r.party || "").toLowerCase().includes(w) || (r.party_abbr || "").toLowerCase().includes(w)
    );

  // The ilike lesson, applied here from day one: at this scale a filter that
  // can silently return zero rows is worse than no filter. If the requested
  // parties match nothing, return ALL parties and let the model pick.
  let rows = data.filter(match);
  if (wanted.length && !rows.length) rows = data;

  const out = {};
  for (const r of rows) {
    const key = r.party || "(no party affiliation)";
    out[key] ||= { total: 0 };
    out[key].total++;
    const bucket = r.status || "unknown";
    (out[key][bucket] ||= []).push({
      id: r.id,
      politician: r.politician,
      promise: (r.promise || "").slice(0, 100),
    });
  }
  return out;
}

async function getStats() {
  const [{ data: promises, error: e1 }, { data: projects, error: e2 }] = await Promise.all([
    db.from("promises_full").select("id,status,category,party,party_abbr,politician,election_cycle,deadline_status"),
    db.from("mega_projects").select("id,name,status,original_deadline,current_deadline,budget_original,budget_allocated"),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  const tally = (rows, key) =>
    rows.reduce((m, r) => ((m[r[key] ?? "unknown"] = (m[r[key] ?? "unknown"] || 0) + 1), m), {});

  const YEAR = 1000 * 60 * 60 * 24 * 365.25;
  let slipped = 0;
  let overrun = 0;
  for (const p of projects) {
    if (p.original_deadline && p.current_deadline) {
      const d = (new Date(p.current_deadline) - new Date(p.original_deadline)) / YEAR;
      if (d > 0) slipped += d;
    }
    if (p.budget_original && p.budget_allocated) {
      const d = Number(p.budget_allocated) - Number(p.budget_original);
      if (d > 0) overrun += d;
    }
  }

  // status x party cross-tab: lets the snapshot answer "who broke/kept the
  // most?" with zero tool calls instead of one search per status.
  const partyStatus = {};
  for (const p of promises) {
    const party = p.party ?? "(no party affiliation)";
    const status = p.status ?? "unknown";
    partyStatus[party] ||= {};
    partyStatus[party][status] = (partyStatus[party][status] || 0) + 1;
  }

  return {
    total_promises: promises.length,
    by_status: tally(promises, "status"),
    by_party: tally(promises, "party"),
    by_party_status: partyStatus,
    by_category: tally(promises, "category"),
    by_politician: tally(promises, "politician"),
    by_election_cycle: tally(promises, "election_cycle"),
    by_deadline_status: tally(promises, "deadline_status"),
    total_projects: projects.length,
    total_years_slipped: Math.round(slipped * 10) / 10,
    total_cost_overrun_npr: overrun,
    note: "Counts are of RECORDED promises only, not every promise ever made. The dataset is small and hand-curated.",
  };
}

async function getProjects(a = {}) {
  const { data: projects, error } = await db.from("mega_projects").select("*");
  if (error) throw new Error(error.message);
  if (!projects.length) return projects;

  const { data: ms } = await db
    .from("project_milestones")
    .select("*")
    .in("project_id", projects.map((p) => p.id))
    .order("event_date", { ascending: true });

  return projects.map((p) => ({ ...p, milestones: (ms || []).filter((m) => m.project_id === p.id) }));
}

async function runTool(name, input) {
  if (name === "search_promises") return searchPromises(input);
  if (name === "get_stats") return getStats();
  if (name === "get_projects") return getProjects(input);
  if (name === "compare_parties") return compareParties(input);
  throw new Error(`Unknown tool: ${name}`);
}

const SYSTEM = `You are the assistant for वाचा (Nepal Promise Tracker), an independent, non-partisan platform that records promises made by Nepali politicians and tracks whether they were kept.

GROUNDING — this is the rule that matters most:
- Answer ONLY from data returned by your tools. Never use prior knowledge about Nepali politics, even if you are confident.
- If the tools return nothing relevant, say the database does not have it. Suggest the user submit it via the "Submit a promise" button. Do not fill the gap from memory.
- Cite promise IDs inline like [#12] and name projects explicitly. Every factual claim must trace to a row.
- Never invent numbers. If a figure is null, say it is not recorded.

ELECTION CYCLES — promises are immutable historical records. A promise stays tied to the election that produced it; only its status changes over time. This means you CAN compare manifestos across cycles: which promises a party repeated, which it dropped, and whether it failed a target and then promised a bigger one. If asked to compare manifestos, filter search_promises by election_cycle and party, and say so plainly.

DEADLINES vs STATUS — these are DIFFERENT and must not be conflated. Status is about fulfilment (kept / broken / in_progress). Deadline status is about timeliness (met / missed / not_due / none). A promise can have a MISSED deadline and still be in_progress — the deadline elapsed, but work is visibly underway and the commitment has not been abandoned. Never say a promise is broken merely because its deadline passed, and never say the government has missed no deadlines just because nothing is marked broken.

METHODOLOGY — explain this when a status is questioned:
- KEPT = officially fulfilled, with proof.
- IN PROGRESS = work visibly started or partial, OR evidence is unclear. This is the conservative default.
- BROKEN = the deadline passed with no fulfilment, or it was explicitly abandoned.
A promise is never marked broken on weak evidence.

HONESTY ABOUT COVERAGE — do not skip this:
The database is small and hand-curated. It is NOT a complete record of Nepali politics. So when a user asks a superlative question ("which party broke the MOST promises?"), answer in terms of what is RECORDED, and say so plainly: "Of the promises recorded here, X has the most broken — but this reflects what has been logged, not a full audit." Never let a count be mistaken for a verdict on a party.

CURRENT DATABASE SNAPSHOT (already loaded — do NOT call get_stats to re-fetch this):
{{STATS}}

Use the snapshot above for any counting or comparison question — its by_party_status cross-tab answers "who kept/broke the most?" with no tool call at all. When a comparison needs promise IDs for citation, call compare_parties ONCE instead of running one search per party. Only call search_promises or get_projects when you need the actual TEXT of promises or the detail of a project.

If a search returns ZERO rows, do NOT conclude the record is absent — retry once with a broader or shorter term (a surname instead of a full name, or no category filter). But if a search returns even ONE row, trust it: report what you found and do not search again to double-check. A small result set means the dataset is thin, not that the query failed.

FOLLOW-UPS — earlier turns of this conversation may be included. Interpret short follow-up questions ("what about NC?", "and in 2022?") in the context of what was just discussed. But the GROUNDING rule still applies to every answer: re-derive facts from the snapshot or a fresh tool call — do not simply repeat numbers from your own earlier answers.

NEVER narrate what you are about to do. Do not write "let me check", "I will look that up", or a preliminary guess before calling a tool. Call the tool silently, THEN write your answer. Your first written words should be the answer itself.

TONE: neutral, factual, dry. You are a record, not a commentator. No editorialising about parties or politicians. If a user asks you to rate, insult, or endorse anyone, decline and give them the data instead.

FORMAT: this renders in a narrow chat panel. Plain prose and simple hyphen lists only. NO markdown tables, NO headers, NO horizontal rules, NO emoji, NO bold-heavy formatting. Keep it under 120 words unless the question genuinely needs more. Work the coverage caveat into a sentence — do not append it as a warning block.

Answer in {{LANG}}.`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only." });
  if (!db) return res.status(500).json({ error: "Server is missing Supabase credentials." });
  if (!process.env.ANTHROPIC_API_KEY)
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });

  const { question, messages: history, lang } = req.body || {};

  // Accept the new shape { messages: [...] } or the legacy { question }.
  // History gives the model memory for follow-ups; we only ever receive the
  // SETTLED text of previous answers (never held/streaming fragments).
  let turns;
  if (Array.isArray(history) && history.length) {
    turns = history
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim()
      )
      // Users are capped at 500 chars (same as before); old answers at 2000.
      .map((m) => ({ role: m.role, content: m.content.trim().slice(0, m.role === "user" ? 500 : 2000) }))
      // Last 4 exchanges + the new question. Keeps tokens and latency flat —
      // the ~7s we accepted must not creep upward as chats get long.
      .slice(-9);

    // The Anthropic API requires alternating roles starting with `user`:
    // merge accidental same-role runs, drop a leading assistant turn.
    const merged = [];
    for (const t of turns) {
      const last = merged[merged.length - 1];
      if (last && last.role === t.role) last.content += "\n" + t.content;
      else merged.push({ ...t });
    }
    while (merged.length && merged[0].role !== "user") merged.shift();
    turns = merged;

    if (!turns.length || turns[turns.length - 1].role !== "user")
      return res.status(400).json({ error: "messages must end with a user question." });
  } else {
    if (!question || typeof question !== "string" || !question.trim())
      return res.status(400).json({ error: "A question is required." });
    if (question.length > 500) return res.status(400).json({ error: "Question is too long (500 char max)." });
    turns = [{ role: "user", content: question.trim() }];
  }

  // Server-Sent Events. The tool loop runs here, invisibly; the moment the
  // model starts writing prose we forward it token by token. Total time is
  // unchanged — but the user sees words at ~1s instead of a blank box at 11s.
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-transform");
  res.setHeader("Connection", "keep-alive");

  const emit = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  let snapshot;
  try {
    snapshot = JSON.stringify(await getStats());
  } catch (err) {
    console.error("stats prefetch failed:", err.message);
    snapshot = "(unavailable — call get_stats)";
  }

  const system = SYSTEM
    .replace("{{LANG}}", lang === "ne" ? "Nepali (नेपाली)" : "English")
    .replace("{{STATS}}", snapshot);

  const messages = turns;

  try {
    for (let turn = 0; turn < 5; turn++) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          system,
          tools: TOOLS,
          messages,
          stream: true,
        }),
      });

      if (!r.ok) {
        console.error("Anthropic API error:", r.status, await r.text());
        emit("error", { message: "The assistant is unavailable right now." });
        return res.end();
      }

      // Reassemble the streamed blocks. Text deltas go straight to the client;
      // tool_use blocks are buffered until complete, then executed.
      const blocks = [];
      let stopReason = null;
      let buf = "";
      let sawTool = false;

      const reader = r.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const lines = buf.split("\n");
        buf = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let ev;
          try {
            ev = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (ev.type === "content_block_start") {
            const b = ev.content_block;
            blocks[ev.index] =
              b.type === "tool_use"
                ? { type: "tool_use", id: b.id, name: b.name, input: "" }
                : { type: "text", text: "" };
            if (b.type === "tool_use") {
              sawTool = true;
              emit("reset", { reason: b.name }); // wipe any text streamed this turn
            }
          }

          if (ev.type === "content_block_delta") {
            const b = blocks[ev.index];
            if (!b) continue;
            if (ev.delta.type === "text_delta") {
              b.text += ev.delta.text;
              emit("token", { text: ev.delta.text });
            }
            if (ev.delta.type === "input_json_delta") {
              b.input += ev.delta.partial_json;
            }
          }

          if (ev.type === "message_delta" && ev.delta?.stop_reason) {
            stopReason = ev.delta.stop_reason;
          }
        }
      }

      // Tool inputs arrive as a JSON string built from deltas — parse now.
      const content = blocks.filter(Boolean).map((b) =>
        b.type === "tool_use"
          ? { type: "tool_use", id: b.id, name: b.name, input: b.input ? JSON.parse(b.input) : {} }
          : { type: "text", text: b.text }
      );

      messages.push({ role: "assistant", content });

      if (stopReason !== "tool_use") {
        emit("done", {});
        return res.end();
      }

      const results = [];
      for (const c of content.filter((b) => b.type === "tool_use")) {
        try {
          const out = await runTool(c.name, c.input);
          results.push({ type: "tool_result", tool_use_id: c.id, content: JSON.stringify(out) });
        } catch (err) {
          console.error("Tool failed:", c.name, err.message);
          results.push({
            type: "tool_result",
            tool_use_id: c.id,
            content: `Error: ${err.message}`,
            is_error: true,
          });
        }
      }
      messages.push({ role: "user", content: results });
    }

    emit("error", { message: "I couldn't work that out. Try asking something more specific." });
    res.end();
  } catch (err) {
    console.error("ask.js failed:", err);
    emit("error", { message: "Something went wrong." });
    res.end();
  }
}
