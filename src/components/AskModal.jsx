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
    setTurns((prev) => [...prev, { role: "user", text: q }]);
    setBusy(true);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Request failed");
      setTurns((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setError(err.message);
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

          {busy && (
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
