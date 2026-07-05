import { useEffect } from "react";

const TYPE_META = {
  made:     { color: "#1E3A5F", label: "Promised" },
  progress: { color: "#C77D00", label: "Progress" },
  kept:     { color: "#1B7A3D", label: "Kept" },
  broken:   { color: "#B3261E", label: "Broken" },
  evidence: { color: "#555555", label: "Evidence" },
};

function fmtDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function TimelineModal({ promise, events, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!promise) return null;

  const sorted = [...events].sort(
    (a, b) => new Date(a.event_date) - new Date(b.event_date)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="tl-title">Evidence timeline</h2>
        <p className="tl-promise">“{promise.promise}”</p>
        <p className="tl-sub">{promise.politician}{promise.party ? ` · ${promise.party}` : ""}</p>

        {sorted.length === 0 ? (
          <p className="empty">No timeline events recorded yet for this promise.</p>
        ) : (
          <ol className="tl-list">
            {sorted.map((ev) => {
              const meta = TYPE_META[ev.event_type] || TYPE_META.evidence;
              return (
                <li className="tl-item" key={ev.id}>
                  <span className="tl-dot" style={{ background: meta.color }} />
                  <div className="tl-body">
                    <div className="tl-row">
                      <span className="tl-date">{fmtDate(ev.event_date)}</span>
                      <span className="tl-tag" style={{ color: meta.color, borderColor: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="tl-event-title">{ev.title}</div>
                    {ev.description && <p className="tl-desc">{ev.description}</p>}
                    {ev.source_url && (
                      <a className="tl-source" href={ev.source_url} target="_blank" rel="noreferrer">
                        Source →
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
