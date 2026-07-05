import { useEffect, useMemo } from "react";

/* PoliticianModal — one politician's facts: bio, party, position, promises. */
export default function PoliticianModal({ politician, promises, onClose }) {
  useEffect(() => {
    if (!politician) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [politician, onClose]);

  const info = useMemo(() => {
    if (!politician) return null;
    const rows = promises.filter((p) => p.politician === politician);
    const counts = { kept: 0, broken: 0, in_progress: 0 };
    for (const r of rows) {
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    }
    const first = rows[0] || {};
    return {
      rows,
      counts,
      bio: first.politician_bio || "",
      party: first.party || "",
      color: first.party_color || "#1E3A5F",
      position: first.position || "",
      total: rows.length,
    };
  }, [politician, promises]);

  if (!politician || !info) return null;

  const statusLabel = { kept: "Kept", broken: "Broken", in_progress: "In progress" };
  const statusClass = { kept: "chip-kept", broken: "chip-broken", in_progress: "chip-progress" };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal party-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pol-title"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTopColor: info.color }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <h2 id="pol-title" className="modal-title" style={{ color: info.color }}>
          {politician}
        </h2>
        <p className="pol-subhead">
          {info.position}
          {info.party && <span className="dot-sep"> · </span>}
          {info.party}
        </p>

        {info.bio && <p className="pol-bio">{info.bio}</p>}

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
                  <span>{p.category}</span>
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
