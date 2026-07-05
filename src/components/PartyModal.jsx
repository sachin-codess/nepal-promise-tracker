import { useEffect, useMemo } from "react";

/* PartyModal — one party's track record: stats, politicians, promises. */
export default function PartyModal({ party, promises, onClose }) {
  useEffect(() => {
    if (!party) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [party, onClose]);

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

  const statusLabel = { kept: "Kept", broken: "Broken", in_progress: "In progress" };
  const statusClass = { kept: "chip-kept", broken: "chip-broken", in_progress: "chip-progress" };

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
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <h2 id="party-title" className="modal-title" style={{ color: info.color }}>
          {party} {info.abbr && <span className="party-abbr">({info.abbr})</span>}
        </h2>

        <div className="party-stats">
          <div className="party-stat">
            <span className="party-stat-num">{info.total}</span>
            <span className="party-stat-label">Promises</span>
          </div>
          <div className="party-stat">
            <span className="party-stat-num" style={{ color: "#1a7a3c" }}>{info.counts.kept}</span>
            <span className="party-stat-label">Kept</span>
          </div>
          <div className="party-stat">
            <span className="party-stat-num" style={{ color: "#c0281f" }}>{info.counts.broken}</span>
            <span className="party-stat-label">Broken</span>
          </div>
          <div className="party-stat">
            <span className="party-stat-num" style={{ color: "#a5730a" }}>{info.counts.in_progress}</span>
            <span className="party-stat-label">In progress</span>
          </div>
        </div>

        <section className="modal-section">
          <h3>Politicians</h3>
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
          <h3>Promises ({info.total})</h3>
          <ul className="party-promise-list">
            {info.rows.map((p) => (
              <li key={p.id} className="party-promise">
                <div className="party-promise-top">
                  <span className={`chip ${statusClass[p.status]}`}>{statusLabel[p.status]}</span>
                  <span className="party-promise-cat">{p.category}</span>
                </div>
                <p className="party-promise-text">"{p.promise}"</p>
                <div className="party-promise-meta">
                  <span>{p.politician}</span>
                  {p.source_url && (
                    <a href={p.source_url} target="_blank" rel="noopener noreferrer">
                      View source →
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
