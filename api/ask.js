// AI assistant over the promise database.
// POST { question, lang } -> { answer, tools_used }
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
      "Get mega-projects (Fast Track, Melamchi, Nijgadh, Pokhara Airport) with deadline slippage, cost overrun, and their milestone history. Use for questions about infrastructure projects, delays, or what happened to a specific project.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name, partial match allowed." },
        include_milestones: { type: "boolean", description: "Include the dated milestone chain. Default true." },
      },
    },
  },
];

async function searchPromises(a = {}) {
  let q = db.from("promises_full").select("*").limit(60);
  if (a.status) q = q.eq("status", a.status);
  if (a.category) q = q.ilike("category", `%${a.category}%`);
  if (a.politician) q = q.ilike("politician", `%${a.politician}%`);
  if (a.party) q = q.or(`party.ilike.%${a.party}%,party_abbr.ilike.%${a.party}%`);
  if (a.province) q = q.ilike("province", `%${a.province}%`);
  if (a.query) q = q.ilike("promise", `%${a.query}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

async function getStats() {
  const [{ data: promises, error: e1 }, { data: projects, error: e2 }] = await Promise.all([
    db.from("promises_full").select("id,status,category,party,party_abbr,politician"),
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

  return {
    total_promises: promises.length,
    by_status: tally(promises, "status"),
    by_party: tally(promises, "party"),
    by_category: tally(promises, "category"),
    by_politician: tally(promises, "politician"),
    total_projects: projects.length,
    total_years_slipped: Math.round(slipped * 10) / 10,
    total_cost_overrun_npr: overrun,
    note: "Counts are of RECORDED promises only, not every promise ever made. The dataset is small and hand-curated.",
  };
}

async function getProjects(a = {}) {
  let q = db.from("mega_projects").select("*");
  if (a.name) q = q.ilike("name", `%${a.name}%`);
  const { data: projects, error } = await q;
  if (error) throw new Error(error.message);
  if (a.include_milestones === false || !projects.length) return projects;

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
  throw new Error(`Unknown tool: ${name}`);
}

const SYSTEM = `You are the assistant for वाचा (Nepal Promise Tracker), an independent, non-partisan platform that records promises made by Nepali politicians and tracks whether they were kept.

GROUNDING — this is the rule that matters most:
- Answer ONLY from data returned by your tools. Never use prior knowledge about Nepali politics, even if you are confident.
- If the tools return nothing relevant, say the database does not have it. Suggest the user submit it via the "Submit a promise" button. Do not fill the gap from memory.
- Cite promise IDs inline like [#12] and name projects explicitly. Every factual claim must trace to a row.
- Never invent numbers. If a figure is null, say it is not recorded.

METHODOLOGY — explain this when a status is questioned:
- KEPT = officially fulfilled, with proof.
- IN PROGRESS = work visibly started or partial, OR evidence is unclear. This is the conservative default.
- BROKEN = the deadline passed with no fulfilment, or it was explicitly abandoned.
A promise is never marked broken on weak evidence.

HONESTY ABOUT COVERAGE — do not skip this:
The database is small and hand-curated. It is NOT a complete record of Nepali politics. So when a user asks a superlative question ("which party broke the MOST promises?"), answer in terms of what is RECORDED, and say so plainly: "Of the promises recorded here, X has the most broken — but this reflects what has been logged, not a full audit." Never let a count be mistaken for a verdict on a party.

TONE: neutral, factual, dry. You are a record, not a commentator. No editorialising about parties or politicians. If a user asks you to rate, insult, or endorse anyone, decline and give them the data instead.

FORMAT: this renders in a narrow chat panel. Plain prose and simple hyphen lists only. NO markdown tables, NO headers, NO horizontal rules, NO emoji, NO bold-heavy formatting. Keep it under 120 words unless the question genuinely needs more. Work the coverage caveat into a sentence — do not append it as a warning block.

Answer in {{LANG}}.`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only." });
  if (!db) return res.status(500).json({ error: "Server is missing Supabase credentials." });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });

  const { question, lang } = req.body || {};
  if (!question || typeof question !== "string" || !question.trim())
    return res.status(400).json({ error: "A question is required." });
  if (question.length > 500) return res.status(400).json({ error: "Question is too long (500 char max)." });

  const system = SYSTEM.replace("{{LANG}}", lang === "ne" ? "Nepali (नेपाली)" : "English");
  const messages = [{ role: "user", content: question.trim() }];
  const toolsUsed = [];

  try {
    // Agentic loop. Capped: the model gets a few rounds of retrieval, not infinite.
    for (let turn = 0; turn < 5; turn++) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ model: MODEL, max_tokens: 1500, system, tools: TOOLS, messages }),
      });

      if (!r.ok) {
        const t = await r.text();
        console.error("Anthropic API error:", r.status, t);
        return res.status(502).json({ error: "The assistant is unavailable right now." });
      }

      const data = await r.json();
      messages.push({ role: "assistant", content: data.content });

      if (data.stop_reason !== "tool_use") {
        const answer = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
        return res.status(200).json({ answer, tools_used: toolsUsed });
      }

      const calls = data.content.filter((b) => b.type === "tool_use");
      const results = [];
      for (const c of calls) {
        toolsUsed.push(c.name);
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

    return res.status(200).json({
      answer: "I couldn't work that out from the database. Try asking something more specific.",
      tools_used: toolsUsed,
    });
  } catch (err) {
    console.error("ask.js failed:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
