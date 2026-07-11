import { useEffect, useMemo, useState } from "react";
import { useT, useCat } from "../lib/i18n";

/* PartyModal — one party's track record: stats, politicians, promises. */
export default function PartyModal({ party, promises, onClose }) {
  const t = useT();
  const cat = useCat();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!party) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [party, onClose]);

  // Reset the status filter whenever a different party opens.
  useEffect(() => { setFilter("all"); }, [party]);

  const info = useMemo(() => {
    if (!party) return null;
    const rows = promises.filter((p) => p.party === party);
    const counts = { kept: 0, broken: 0, in_progress: 0 };
    for (const r of rows) {
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    }
    const polMap = new Map();
    for (const r of rows) {
      if (r.politician && !polMap.has(r.politician)) {
        polMap.set(r.politician, r.position || "");
      }
    }
    const politicians = [...polMap.entries()].map(([name, position]) => ({ name, position }));
    const color = rows[0]?.party_color || "#1E3A5F";
    const abbr = rows[0]?.party_abbr || "";
    return { rows, counts, politicians, color, abbr, total: rows.length };
  }, [party, promises]);

  if (!party || !info) return null;

  const statusLabel = { kept: t("kept"), broken: t("broken"), in_progress: t("inProgress") };
  const statusClass = { kept: "chip-kept", broken: "chip-broken", in_progress: "chip-progress" };

  // Click a stat to filter; click the active one again to reset.
  const pick = (key) => setFilter(filter === key ? "all" : key);
  const shown = filter === "all" ? info.rows : info.rows.filter((p) => p.status === filter);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal party-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="party-title"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTopColor: info.color }}
      >
        <button className="modal-close" onClick={onClose} aria-label={t("close")}>×</button>

        <h2 id="party-title" className="modal-title" style={{ color: info.color }}>
          {party} {info.abbr && <span className="party-abbr">({info.abbr})</span>}
        </h2>

        <div className="party-stats">
          <button
            type="button"
            className={"party-stat" + (filter === "all" ? " party-stat-active" : "")}
            onClick={() => setFilter("all")}
          >
            <span className="party-stat-num">{info.total}</span>
            <span className="party-stat-label">{t("promisesLabel")}</span>
          </button>
          <button
            type="button"
            className={"party-stat" + (filter === "kept" ? " party-stat-active" : "")}
            onClick={() => pick("kept")}
          >
            <span className="party-stat-num" style={{ color: "#1a7a3c" }}>{info.counts.kept}</span>
            <span className="party-stat-label">{t("kept")}</span>
          </button>
          <button
            type="button"
            className={"party-stat" + (filter === "broken" ? " party-stat-active" : "")}
            onClick={() => pick("broken")}
          >
            <span className="party-stat-num" style={{ color: "#c0281f" }}>{info.counts.broken}</span>
            <span className="party-stat-label">{t("broken")}</span>
          </button>
          <button
            type="button"
            className={"party-stat" + (filter === "in_progress" ? " party-stat-active" : "")}
            onClick={() => pick("in_progress")}
          >
            <span className="party-stat-num" style={{ color: "#a5730a" }}>{info.counts.in_progress}</span>
            <span className="party-stat-label">{t("inProgress")}</span>
          </button>
        </div>

        <section className="modal-section">
          <h3>{t("politiciansH")}</h3>
          <ul className="party-pol-list">
            {info.politicians.map((pol) => (
              <li key={pol.name}>
                <span className="party-pol-name">{pol.name}</span>
                {pol.position && <span className="party-pol-pos">{pol.position}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="modal-section">
          <h3>{t("promisesH")} ({shown.length}{filter !== "all" ? ` ${t("ofTotal")} ${info.total}` : ""})</h3>
          <ul className="party-promise-list">
            {shown.map((p) => (
              <li key={p.id} className="party-promise">
                <div className="party-promise-top">
                  <span className={`chip ${statusClass[p.status]}`}>{statusLabel[p.status]}</span>
                  <span className="party-promise-cat">{cat(p.category)}</span>
                </div>
                <p className="party-promise-text">"{p.promise}"</p>
                <div className="party-promise-meta">
                  <span>{p.politician}</span>
                  {p.source_url && (
                    <a href={p.source_url} target="_blank" rel="noopener noreferrer">
                      {t("viewSource")}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
