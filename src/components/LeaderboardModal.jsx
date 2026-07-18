import { useEffect, useMemo, useState } from "react";
import { useT } from "../lib/i18n";
import { partyLeaderboard, politicianLeaderboard } from "../lib/scoring";

/* LeaderboardModal — Accountability Scores for parties and politicians.
   Ranked by weighted score (0–100); Resolution Rate shown alongside but never
   ranks. Provisional rows (thin data) are greyed and badged, never hidden. */

const CONF_LABEL = { high: "confHigh", medium: "confMedium", low: "confLow" };

// Party marker: a bold colour chip, with an optional logo overlaid on top.
// The logo is looked up by abbreviation at /party-logos/{ABBR}.png. If no such
// file exists (the default today), onError hides the img and the colour chip
// shows through. Drop logo files in later and they light up automatically —
// no DB change, no code change.
function PartyMark({ color, abbr }) {
  const [logoOk, setLogoOk] = useState(true);
  const src = abbr ? `/party-logos/${abbr}.png` : null;
  return (
    <span className="lb-mark" style={{ background: color || "#1E3A5F" }}>
      {src && logoOk && (
        <img
          className="lb-mark-logo"
          src={src}
          alt=""
          onError={() => setLogoOk(false)}
        />
      )}
    </span>
  );
}

// A single leaderboard row — shared shape for parties and politicians.
function Row({ rank, name, sub, color, abbr, s, t }) {
  return (
    <li className={"lb-row" + (s.provisional ? " lb-row-provisional" : "")}>
      <span className="lb-rank">{rank}</span>
      <PartyMark color={color} abbr={abbr} />
      <div className="lb-id">
        <span className="lb-name">{name}</span>
        {sub && <span className="lb-sub">{sub}</span>}
      </div>
      <div className="lb-metrics">
        <div className="lb-score">
          <span className="lb-score-num">{s.score}</span>
          <span className="lb-score-max">/100</span>
        </div>
        <div className="lb-secondary">
          <span className="lb-resolution">
            {t("lbResolution")}: {s.resolutionRate === null ? "—" : s.resolutionRate + "%"}
          </span>
          <span className={"lb-conf lb-conf-" + s.confidence}>
            {t(CONF_LABEL[s.confidence])}
            {s.provisional ? " · " + t("lbProvisional") : ""}
            {" · " + s.total + " " + t("lbTracked")}
          </span>
        </div>
      </div>
    </li>
  );
}

export default function LeaderboardModal({ open, promises, onClose }) {
  const t = useT();
  const [tab, setTab] = useState("parties");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => { if (open) setTab("parties"); }, [open]);

  const parties = useMemo(() => (open ? partyLeaderboard(promises) : []), [open, promises]);
  const politicians = useMemo(() => (open ? politicianLeaderboard(promises) : []), [open, promises]);

  if (!open) return null;

  const rows = tab === "parties" ? parties : politicians;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal lb-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lb-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={t("close")}>×</button>

        <h2 id="lb-title" className="modal-title">{t("lbTitle")}</h2>
        <p className="lb-intro">{t("lbIntro")}</p>

        <div className="lb-tabs">
          <button
            type="button"
            className={"lb-tab" + (tab === "parties" ? " lb-tab-active" : "")}
            onClick={() => setTab("parties")}
          >
            {t("lbParties")}
          </button>
          <button
            type="button"
            className={"lb-tab" + (tab === "politicians" ? " lb-tab-active" : "")}
            onClick={() => setTab("politicians")}
          >
            {t("lbPoliticians")}
          </button>
        </div>

        <ol className="lb-list">
          {rows.map((r, i) =>
            tab === "parties" ? (
              <Row
                key={r.party}
                rank={i + 1}
                name={r.party}
                sub={r.abbr}
                color={r.color}
                abbr={r.abbr}
                s={r}
                t={t}
              />
            ) : (
              <Row
                key={r.politician}
                rank={i + 1}
                name={r.politician}
                sub={[r.position, r.party].filter(Boolean).join(" · ")}
                color={null}
                abbr={null}
                s={r}
                t={t}
              />
            )
          )}
        </ol>

        <p className="lb-footnote">{t("lbFootnote")}</p>
      </div>
    </div>
  );
}
