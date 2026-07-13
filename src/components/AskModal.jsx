import { useState, useRef, useEffect } from "react";
import { useT, useLang } from "../lib/i18n";

// Chat panel over the promise DB. Talks to /api/ask, which runs the
// tool-calling loop server-side — the API key never reaches the browser.

export default function AskModal({ open, onClose }) {
  const t = useT();
  const { lang } = useLang();
  const [turns, setTurns] = useState([]); // { role: 'user'|'ai', text }
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, busy]);

  if (!open) return null;

  const SUGGESTIONS = [t("askS1"), t("askS2"), t("askS3"), t("askS4")];

  async function send(question) {
    const q = (question ?? input).trim();
    if (!q || busy) return;
    setInput("");
    setError(null);
    setTurns((prev) => [...prev, { role: "user", text: q }, { role: "ai", text: "" }]);
    setBusy(true);

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang }),
      });

      if (!r.ok || !r.body) {
        const msg = await r.json().catch(() => ({}));
        throw new Error(msg.error || "Request failed");
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let event = null;

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

          if (event === "token") patchLast((t) => t + payload.text);
          if (event === "reset") patchLast(() => "");
          if (event === "error") throw new Error(payload.message);
        }
      }
    } catch (err) {
      setError(err.message);
      setTurns((prev) => prev.filter((t, i) => !(i === prev.length - 1 && t.role === "ai" && !t.text)));
    } finally {
      setBusy(false);
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
                <p key={j}>{para}</p>
              ))}
            </div>
          ))}

          {busy && !turns[turns.length - 1]?.text && (
            <div className="ask-turn ask-ai ask-busy">
              <p>{t("askThinking")}</p>
            </div>
          )}
          {error && <div className="ask-error">{error}</div>}
          <div ref={endRef} />
        </div>

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
