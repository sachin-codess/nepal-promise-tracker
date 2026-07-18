import { useEffect, useMemo, useState } from "react";
import { useT } from "../lib/i18n";
import { partyLeaderboard, politicianLeaderboard } from "../lib/scoring";

/* LeaderboardModal — Accountability Scores for parties and politicians.
   Ranked by weighted score (0–100); Resolution Rate shown alongside but never
   ranks. Provisional rows (thin data) are greyed and badged, never hidden. */

const CONF_LABEL = { high: "confHigh", medium: "confMedium", low: "confLow" };

// Colour the score by how strong it is — but ONLY when the data is trustworthy.
// A Provisional (thin-data) row stays neutral even with a high number, so bright
// green never overstates a score built on two or three promises.
function scoreClass(s) {
  if (s.provisional) return "lb-score-neutral";
  if (s.score >= 70) return "lb-score-strong";
  if (s.score >= 45) return "lb-score-mid";
  return "lb-score-weak";
}

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

// Politician portrait, mirroring PartyMark's fallback contract exactly:
// try /politician-photos/{slug}.jpg, and if the file isn't there the <img>
// errors and we fall back to initials on the party colour. This means the
// component is inert until photo files actually exist in /public — no photos,
// no visual change, no broken-image icons.
//
// LICENSING: only drop in photos you have the right to host. Wikimedia Commons
// portraits are the practical source, but each one's licence must be checked
// individually and attributed where its licence requires it. This is a public
// accountability site; an unlicensed press photo is a real liability.
function PoliticianFace({ color, name }) {
  const [photoOk, setPhotoOk] = useState(true);
  const slug = name
    ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : null;
  const src = slug ? `/politician-photos/${slug}.jpg` : null;
  const initials = (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span className="lb-mark lb-face" style={{ background: color || "#5A6B8C" }}>
      {src && photoOk ? (
        <img
          className="lb-face-photo"
          src={src}
          alt=""
          onError={() => setPhotoOk(false)}
        />
      ) : (
        <span className="lb-face-initials" aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}

// A single leaderboard row — shared shape for parties and politicians.
// The whole row is a button: seeing "Balen Shah 73/100" should let you drill
// straight into the promises that produced it. The mark and the name are inside
// the button, so clicking the logo/chip works too.
function Row({ rank, name, sub, color, abbr, s, t, onSelect, face }) {
  return (
    <li className={"lb-row" + (s.provisional ? " lb-row-provisional" : "")}>
      <button
        type="button"
        className="lb-row-btn"
        onClick={onSelect}
        aria-label={`${name} — ${s.score}/100`}
      >
      <span className="lb-rank">{rank}</span>
      {face ? <PoliticianFace color={color} name={name} /> : <PartyMark color={color} abbr={abbr} />}
      <div className="lb-id">
        <span className="lb-name">{name}</span>
        {sub && <span className="lb-sub">{sub}</span>}
      </div>
      <div className="lb-metrics">
        <div className="lb-score">
          <span className={"lb-score-num " + scoreClass(s)}>{s.score}</span>
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
      <span className="lb-row-chevron" aria-hidden="true">›</span>
      </button>
    </li>
  );
}

export default function LeaderboardModal({ open, promises, onClose, onSelectParty, onSelectPolitician, stacked }) {
  const t = useT();
  const [tab, setTab] = useState("parties");

  // Escape closes the leaderboard — but NOT while a party/politician modal is
  // stacked on top of it. Those modals bind their own Escape handler, so without
  // this guard one keypress would close both and dump the user back to the grid
  // instead of back to the leaderboard they came from.
  useEffect(() => {
    if (!open || stacked) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stacked, onClose]);

  useEffect(() => { if (open) setTab("parties"); }, [open]);

  const parties = useMemo(() => (open ? partyLeaderboard(promises) : []), [open, promises]);
  const politicians = useMemo(() => (open ? politicianLeaderboard(promises) : []), [open, promises]);

  if (!open) return null;

  const rows = tab === "parties" ? parties : politicians;

  return (
    <div
      className={"modal-overlay" + (stacked ? " modal-overlay-behind" : "")}
      onClick={stacked ? undefined : onClose}
    >
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
                onSelect={() => onSelectParty(r.party)}
              />
            ) : (
              <Row
                key={r.politician}
                rank={i + 1}
                name={r.politician}
                sub={[r.position, r.party].filter(Boolean).join(" · ")}
                color={r.color}
                abbr={null}
                face
                s={r}
                t={t}
                onSelect={() => onSelectPolitician(r.politician)}
              />
            )
          )}
        </ol>

        <p className="lb-footnote">{t("lbFootnote")}</p>
      </div>
    </div>
  );
}
