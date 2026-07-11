import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Admin review panel. Shows AI-drafted promises from `pending_promises`,
// lets you approve (copy into live `promises`) or reject (delete).
// Only rendered when the URL has ?admin — never on the public site.
export default function AdminPanel() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [articleText, setArticleText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [drafting, setDrafting] = useState(false);

  // Public submissions queue (separate table, separate route)
  const [subs, setSubs] = useState([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsMsg, setSubsMsg] = useState("");
  const [subBusyId, setSubBusyId] = useState(null);
  const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;

  // Call our serverless function to extract promise drafts from pasted text,
  // then insert each draft into `pending_promises` for review below.
  async function draftFromArticle() {
    if (articleText.trim().length < 40) {
      setMsg("Paste more article text first.");
      return;
    }
    if (sourceUrl.trim().length < 8) {
      setMsg("Paste the article's source URL first — every promise needs a link.");
      return;
    }
    setDrafting(true);
    setMsg("Reading the article…");
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg("Draft failed: " + (data.error || res.status));
        setDrafting(false);
        return;
      }
      const drafts = data.promises || [];
      if (drafts.length === 0) {
        setMsg("No clear promises found in that text.");
        setDrafting(false);
        return;
      }
      // Insert each draft into the holding table. The source URL you typed is
      // stamped onto every draft from this article, overriding anything the AI guessed.
      const rows = drafts.map((d) => ({
        politician_name: d.politician_name || "Unknown",
        party_name: d.party_name || null,
        promise_text: d.promise_text || "",
        category: d.category || null,
        status: d.status || "in_progress",
        province: d.province || "Federal",
        source_url: sourceUrl.trim(),
        date_made: d.date_made || null,
        ai_notes: d.ai_notes || null,
      }));
      const { error } = await supabase.from("pending_promises").insert(rows);
      if (error) { setMsg("Insert failed: " + error.message); setDrafting(false); return; }
      setMsg(`Drafted ${rows.length} promise(s) — review them below.`);
      setArticleText("");
      setSourceUrl("");
      load();
    } catch (e) {
      setMsg("Network error: " + String(e));
    }
    setDrafting(false);
  }

  async function loadSubs() {
    if (!ADMIN_TOKEN) {
      setSubsMsg("VITE_ADMIN_TOKEN not set \u2014 cannot load submissions.");
      setSubsLoading(false);
      return;
    }
    setSubsLoading(true);
    try {
      const r = await fetch(`/api/admin/submissions?token=${encodeURIComponent(ADMIN_TOKEN)}`);
      const j = await r.json();
      if (!r.ok) { setSubsMsg(j.error || "Failed to load submissions."); setSubs([]); }
      else { setSubs(j.data || []); setSubsMsg(""); }
    } catch (e) {
      setSubsMsg("Failed to reach the moderation route. Are you running `vercel dev`?");
    }
    setSubsLoading(false);
  }

  async function moderate(row, action) {
    setSubBusyId(row.id);
    setSubsMsg("");
    try {
      const r = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: ADMIN_TOKEN, id: row.id, action }),
      });
      const j = await r.json();
      if (!r.ok) setSubsMsg(j.error || "Action failed.");
      else {
        setSubsMsg(action === "approve"
          ? `Approved \u2014 promise #${row.id} is now live.`
          : `Rejected submission #${row.id}.`);
        await loadSubs();
      }
    } catch (e) {
      setSubsMsg("Request failed.");
    }
    setSubBusyId(null);
  }

  async function load() {
    if (!supabase) {
      setMsg("Supabase not configured — admin needs the live database.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("pending_promises")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMsg("Load error: " + error.message);
    setPending(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load();
    loadSubs(); }, []);

  // Approve: resolve party + politician to their IDs, insert into `promises`,
  // then remove the draft. We DO NOT touch status logic — you already set it.
  async function approve(row) {
    setBusyId(row.id);
    setMsg("");

    // Guard: never let a promise go live without a source link.
    if (!row.source_url) {
      setMsg("Cannot approve — this draft has no source URL. Reject it and re-draft with a link.");
      setBusyId(null);
      return;
    }

    // 1. Find the party id (if a party name was given).
    let party_id = null;
    if (row.party_name) {
      const { data: pty } = await supabase
        .from("parties").select("id").ilike("name", row.party_name).maybeSingle();
      party_id = pty?.id ?? null;
    }

    // 2. Find or create the politician.
    let politician_id = null;
    const { data: pol } = await supabase
      .from("politicians").select("id").ilike("name", row.politician_name).maybeSingle();
    if (pol) {
      politician_id = pol.id;
    } else {
      const { data: newPol, error: polErr } = await supabase
        .from("politicians")
        .insert({ name: row.politician_name, party_id })
        .select("id").single();
      if (polErr) { setMsg("Politician insert failed: " + polErr.message); setBusyId(null); return; }
      politician_id = newPol.id;
    }

    // 3. Insert the promise into the LIVE table.
    const { error: insErr } = await supabase.from("promises").insert({
      politician_id,
      promise: row.promise_text,
      category: row.category,
      status: row.status,
      province: row.province,
      source_url: row.source_url,
      date_made: row.date_made,
    });
    if (insErr) { setMsg("Promise insert failed: " + insErr.message); setBusyId(null); return; }

    // 4. Delete the draft.
    await supabase.from("pending_promises").delete().eq("id", row.id);
    setMsg(`Approved: "${row.promise_text.slice(0, 40)}…"`);
    setBusyId(null);
    load();
  }

  async function reject(row) {
    setBusyId(row.id);
    await supabase.from("pending_promises").delete().eq("id", row.id);
    setMsg("Rejected and removed.");
    setBusyId(null);
    load();
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui" }}>
      <h1 style={{ color: "#8f2f30" }}>Admin — Promise Review</h1>
      <p style={{ color: "#555" }}>
        AI drafts land here. Verify the source link actually says what the draft claims,
        check the wording is neutral, then Approve or Reject. Nothing here is on the public site yet.
      </p>

      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem 1.25rem",
        margin: "1rem 0", background: "#fff" }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Draft from an article</div>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="Source URL (e.g. https://kathmandupost.com/…)"
          style={{ width: "100%", boxSizing: "border-box", padding: "0.6rem",
            borderRadius: 6, border: "1px solid #ccc", fontFamily: "inherit",
            fontSize: "0.95rem", marginBottom: 8 }}
        />
        <textarea
          value={articleText}
          onChange={(e) => setArticleText(e.target.value)}
          placeholder="Paste the news article text here…"
          rows={6}
          style={{ width: "100%", boxSizing: "border-box", padding: "0.6rem",
            borderRadius: 6, border: "1px solid #ccc", fontFamily: "inherit", fontSize: "0.95rem" }}
        />
        <button onClick={draftFromArticle} disabled={drafting}
          style={{ marginTop: 10, background: "#1E3A5F", color: "#fff", border: "none",
            padding: "0.55rem 1.2rem", borderRadius: 6, cursor: "pointer" }}>
          {drafting ? "Drafting…" : "Draft promises"}
        </button>
      </div>

      {msg && (
        <div style={{ background: "#f5f0e6", border: "1px solid #d9cbb0",
          padding: "0.75rem 1rem", borderRadius: 8, margin: "1rem 0" }}>{msg}</div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : pending.length === 0 ? (
        <p style={{ color: "#777" }}>No pending drafts. (AI drafting comes in the next step.)</p>
      ) : (
        pending.map((row) => (
          <div key={row.id} style={{ border: "1px solid #ddd", borderRadius: 10,
            padding: "1rem 1.25rem", margin: "1rem 0", background: "#fff" }}>
            <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{row.promise_text}</div>
            <div style={{ color: "#555", fontSize: "0.9rem", marginTop: 6 }}>
              <strong>{row.politician_name}</strong>
              {row.party_name ? ` (${row.party_name})` : ""} · {row.category || "—"} · {row.province}
              {" · "}status: <em>{row.status}</em>
              {row.date_made ? ` · ${row.date_made}` : ""}
            </div>
            {row.source_url ? (
              <div style={{ marginTop: 6, fontSize: "0.9rem" }}>
                source:{" "}
                <a href={row.source_url} target="_blank" rel="noreferrer"
                   style={{ color: "#1E3A5F" }}>{row.source_url}</a>
              </div>
            ) : (
              <div style={{ marginTop: 6, fontSize: "0.9rem", color: "#b71c1c" }}>
                ⚠ no source URL — cannot approve
              </div>
            )}
            {row.ai_notes && (
              <div style={{ marginTop: 6, fontSize: "0.85rem", color: "#8a6d3b",
                background: "#fcf8e3", padding: "0.5rem 0.75rem", borderRadius: 6 }}>
                AI note: {row.ai_notes}
              </div>
            )}
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button onClick={() => approve(row)} disabled={busyId === row.id}
                style={{ background: "#2e7d32", color: "#fff", border: "none",
                  padding: "0.5rem 1.1rem", borderRadius: 6, cursor: "pointer" }}>
                {busyId === row.id ? "…" : "Approve"}
              </button>
              <button onClick={() => reject(row)} disabled={busyId === row.id}
                style={{ background: "#fff", color: "#b71c1c", border: "1px solid #b71c1c",
                  padding: "0.5rem 1.1rem", borderRadius: 6, cursor: "pointer" }}>
                Reject
              </button>
            </div>
          </div>
        ))
      )}

      <hr style={{ margin: "2.5rem 0 1.5rem", border: "none", borderTop: "1px solid #ddd" }} />

      <h2 style={{ color: "#8f2f30" }}>Public submissions</h2>
      <p style={{ color: "#555" }}>
        Sent in by the public. Open the source and check it actually says what the
        submission claims. Approving inserts into the live table as <b>in progress</b> —
        never as kept or broken. If the politician isn't in the database yet, add them
        first, then approve.
      </p>

      {subsMsg && (
        <div style={{ margin: "0.75rem 0", padding: "0.6rem 0.9rem", borderRadius: 6,
          background: "#fcf8e3", color: "#8a6d3b", fontSize: "0.9rem" }}>
          {subsMsg}
        </div>
      )}

      {subsLoading ? (
        <p style={{ color: "#777" }}>Loading submissions…</p>
      ) : subs.length === 0 ? (
        <p style={{ color: "#777" }}>No pending submissions.</p>
      ) : (
        subs.map((row) => (
          <div key={row.id} style={{ border: "1px solid #ddd", borderRadius: 10,
            padding: "1rem 1.25rem", margin: "1rem 0", background: "#fff" }}>
            <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{row.politician_name}</div>
            <div style={{ margin: "8px 0", fontStyle: "italic" }}>"{row.promise}"</div>
            <div style={{ fontSize: "0.88rem", color: "#666" }}>
              {row.category || "no category"} · {row.province || "Federal"}
              {row.date_made && ` · promised ${row.date_made}`}
              {row.deadline && ` · deadline ${row.deadline}`}
            </div>
            <div style={{ marginTop: 6, fontSize: "0.9rem" }}>
              <a href={row.source_url} target="_blank" rel="noopener noreferrer">
                {row.source_url}
              </a>
            </div>
            {row.notes && (
              <div style={{ marginTop: 6, fontSize: "0.85rem", color: "#555",
                background: "#f5f5f5", padding: "0.5rem 0.75rem", borderRadius: 6 }}>
                Submitter note: {row.notes}
              </div>
            )}
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button onClick={() => moderate(row, "approve")} disabled={subBusyId === row.id}
                style={{ background: "#2e7d32", color: "#fff", border: "none",
                  padding: "0.5rem 1.1rem", borderRadius: 6, cursor: "pointer" }}>
                {subBusyId === row.id ? "…" : "Approve"}
              </button>
              <button onClick={() => moderate(row, "reject")} disabled={subBusyId === row.id}
                style={{ background: "#fff", color: "#b71c1c", border: "1px solid #b71c1c",
                  padding: "0.5rem 1.1rem", borderRadius: 6, cursor: "pointer" }}>
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
