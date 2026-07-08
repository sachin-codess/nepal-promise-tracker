// Vercel serverless function: extracts candidate promises from pasted article
// text using the Anthropic API. The API key lives ONLY in the server env
// (process.env.ANTHROPIC_API_KEY) and is never sent to the browser.
//
// The AI only DRAFTS. Nothing here writes to the database. The admin page
// takes these drafts, you review each one, and only you approve them in.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server missing ANTHROPIC_API_KEY" });
  }

  const { articleText } = req.body || {};
  if (!articleText || articleText.trim().length < 40) {
    return res.status(400).json({ error: "Please paste more article text." });
  }

  const systemPrompt = `You extract political PROMISES made by Nepali politicians from a news article, for a civic-accountability tracker.

Rules you MUST follow:
- Only extract statements that are genuine PROMISES, pledges, or commitments a named politician made about a future action or goal. Ignore general reporting, opinions, and past events that aren't promises.
- Use NEUTRAL, factual wording. Never editorialize ("failed to", "broke his word", "shamefully"). State the promise plainly.
- If you cannot identify a clear promise by a named politician, return an empty list. Do NOT invent promises.
- Never fabricate a source, date, or politician name. If a field is unknown, use null.
- status must be one of: "kept", "broken", "in_progress". If the article doesn't clearly show the outcome, use "in_progress".
- category is a short label like "Economy", "Governance", "Health", "Infrastructure", "Anti-corruption", etc.
- province: use "Federal" unless the promise is clearly about one specific province.

Return ONLY valid JSON, no markdown, no preamble. Shape:
{"promises":[{"politician_name":"...","party_name":null,"promise_text":"...","category":"...","status":"in_progress","province":"Federal","date_made":null,"ai_notes":"one short line on why this is a promise + any caveat for the reviewer"}]}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [
          { role: "user", content: `Article text:\n\n${articleText}` },
        ],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(502).json({ error: "Anthropic API error", detail: errText });
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    // Strip any accidental code fences, then parse.
    const clean = text.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return res.status(502).json({ error: "AI did not return valid JSON", raw: text });
    }

    const promises = Array.isArray(parsed.promises) ? parsed.promises : [];
    return res.status(200).json({ promises });
  } catch (e) {
    return res.status(500).json({ error: "Function crashed", detail: String(e) });
  }
}
