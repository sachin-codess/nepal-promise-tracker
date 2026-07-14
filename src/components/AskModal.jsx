import { useState, useRef, useEffect } from "react";
import { useT, useLang } from "../lib/i18n";
import PromiseCard from "./PromiseCard";

// Chat panel over the promise DB. Talks to /api/ask, which runs the
// tool-calling loop server-side — the API key never reaches the browser.

export default function AskModal({ open, onClose, promises = [] }) {
  const t = useT();
  const { lang } = useLang();
  const [turns, setTurns] = useState([]); // { role: 'user'|'ai', text }
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(null); // which tool is running, for the status line
  const [error, setError] = useState(null);
  const [cited, setCited] = useState(null); // promise object behind a tapped [#id] citation
  const [chips, setChips] = useState([]); // model-suggested follow-up questions
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, busy]);

  if (!open) return null;

  const SUGGESTIONS = [t("askS1"), t("askS2"), t("askS3"), t("askS4")];

  // Render answer text with [#12]-style citations as tappable buttons.
  // A citation only becomes a button when the id exists in loaded data —
  // an unknown id stays plain text rather than becoming a dead link.
  function renderWithCitations(text) {
    return text.split(/(\[#\d+\])/g).map((part, i) => {
      const m = part.match(/^\[#(\d+)\]$/);
      if (!m) return part;
      const p = promises.find((x) => x.id === Number(m[1]));
      if (!p) return part;
      return (
        <button key={i} className="ask-cite" onClick={() => setCited(p)}>
          {part}
        </button>
      );
    });
  }

  async function send(question) {
    const q = (question ?? input).trim();
    if (!q || busy) return;
    setInput("");
    setError(null);
    setChips([]);

    // The whole visible conversation, oldest first, ending with the new
    // question. Only settled text ever lives in `turns`, so no held or
    // streaming fragments can leak into history. The API expects the role
    // name 'assistant', so map our internal 'ai' before sending.
    const history = [
      ...turns
        .filter((turn) => turn.text)
        .map((turn) => ({ role: turn.role === "ai" ? "assistant" : "user", content: turn.text })),
      { role: "user", content: q },
    ];

    setTurns((prev) => [...prev, { role: "user", text: q }, { role: "ai", text: "" }]);
    setBusy(true);
    setStage(null);

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, lang }),
      });

      if (!r.ok || !r.body) {
        const msg = await r.json().catch(() => ({}));
        throw new Error(msg.error || "Request failed");
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let event = null;
      // False until a tool call has run. Before that, any text is a guess the
      // model may be about to overwrite — hold it back rather than flash it.
      let settled = false;
      const flush = [];

      // Append each token to the last turn as it arrives. On `reset` the
      // model turned out to be calling a tool, so whatever it wrote first
      // was a guess made before checking the data — wipe it.
      const patchLast = (fn) =>
        setTurns((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, text: fn(last.text) };
          return next;
        });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const lines = buf.split("\n");
        buf = lines.pop();

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            event = line.slice(7).trim();
            continue;
          }
          if (!line.startsWith("data: ")) continue;

          let payload;
          try {
            payload = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (event === "token") {
            if (settled) patchLast((t) => t + payload.text);
            else flush.push(payload.text); // hold: might be a pre-tool guess
          }
          if (event === "tool" || event === "reset") {
            settled = true;   // any text after a tool call is the real answer
            flush.length = 0; // drop the guess entirely — it never rendered
            const key = payload.name || payload.reason;
            if (key) setStage(key);
          }
          if (event === "chips" && Array.isArray(payload.chips)) {
            setChips(payload.chips);
          }
          if (event === "done" && !settled) {
            // No tool was called: the held text WAS the answer. Paint it.
            patchLast(() => flush.join(""));
          }
          if (event === "error") throw new Error(payload.message);
        }
      }
    } catch (err) {
      setError(err.message);
      setTurns((prev) => prev.filter((t, i) => !(i === prev.length - 1 && t.role === "ai" && !t.text)));
    } finally {
      setBusy(false);
      setStage(null);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ask-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>{t("askTitle")}</h2>
        <p className="ask-sub">{t("askSub")}</p>

        <div className="ask-log">
          {turns.length === 0 && (
            <div className="ask-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="ask-chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {turns.map((turn, i) => (
            <div key={i} className={`ask-turn ask-${turn.role}`}>
              {turn.text.split("\n").filter(Boolean).map((para, j) => (
                <p key={j}>{turn.role === "ai" ? renderWithCitations(para) : para}</p>
              ))}
            </div>
          ))}

          {busy && !turns[turns.length - 1]?.text && (
            <div className="ask-turn ask-ai ask-busy">
              <p>
                {stage === "search_promises"
                  ? t("askStagePromises")
                  : stage === "get_projects"
                  ? t("askStageProjects")
                  : stage === "get_stats"
                  ? t("askStageStats")
                  : stage === "compare_parties"
                  ? t("askStageCompare")
                  : t("askThinking")}
              </p>
            </div>
          )}
          {!busy && chips.length > 0 && (
            <div className="ask-suggestions ask-followups">
              {chips.map((c) => (
                <button key={c} className="ask-chip" onClick={() => send(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
          {error && <div className="ask-error">{error}</div>}
          <div ref={endRef} />
        </div>

        {cited && (
          <div className="ask-cite-panel" onClick={() => setCited(null)}>
            <div className="ask-cite-inner" onClick={(e) => e.stopPropagation()}>
              <button className="ask-cite-close" onClick={() => setCited(null)}>
                {t("askCitedClose")} ×
              </button>
              <PromiseCard p={cited} />
            </div>
          </div>
        )}

        <div className="ask-input-row">
          <input
            type="text"
            value={input}
            placeholder={t("askPlaceholder")}
            maxLength={500}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="ask-send" disabled={busy || !input.trim()} onClick={() => send()}>
            {t("askSend")}
          </button>
        </div>

        <p className="ask-disclaimer">{t("askDisclaimer")}</p>
      </div>
    </div>
  );
}
