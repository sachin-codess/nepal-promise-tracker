import { useEffect } from "react";
import { useT } from "../lib/i18n";

const SEG = {
  kept:        { color: "#1B7A3D", label: "Kept" },
  in_progress: { color: "#C77D00", label: "In progress" },
  broken:      { color: "#B3261E", label: "Broken" },
};

// Build the SVG arc path for one donut segment.
function arc(cx, cy, rOuter, rInner, start, end) {
  const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const large = end - start > Math.PI ? 1 : 0;
  const [x1, y1] = p(rOuter, start);
  const [x2, y2] = p(rOuter, end);
  const [x3, y3] = p(rInner, end);
  const [x4, y4] = p(rInner, start);
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

export default function AnalyticsModal({ open, promises, onClose }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const counts = { kept: 0, in_progress: 0, broken: 0 };
  for (const p of promises) if (counts[p.status] !== undefined) counts[p.status]++;
  const total = counts.kept + counts.in_progress + counts.broken;

  const cx = 110, cy = 110, rOuter = 100, rInner = 62;
  let angle = -Math.PI / 2; // start at top
  const T_KEY = { kept: "kept", in_progress: "inProgress", broken: "broken" };
  const segments = Object.entries(SEG).map(([key, meta]) => {
    const value = counts[key];
    const frac = total ? value / total : 0;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    const pct = total ? Math.round((value / total) * 100) : 0;
    return { key, meta, value, pct, path: frac > 0 ? arc(cx, cy, rOuter, rInner, start, end) : null };
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={t("close")}>×</button>
        <h2 className="tl-title">{t("analyticsTitle")}</h2>
        <p className="tl-sub">{total} {t("promisesTracked").toLowerCase()}</p>

        <div className="an-wrap">
          <svg width="220" height="220" viewBox="0 0 220 220" role="img" aria-label={t("donutAria")}>
            {segments.map((s) => s.path && (
              <path key={s.key} d={s.path} fill={s.meta.color} />
            ))}
            <text x="110" y="104" textAnchor="middle" className="an-center-num">{total}</text>
            <text x="110" y="126" textAnchor="middle" className="an-center-label">{t("donutCenter")}</text>
          </svg>

          <ul className="an-legend">
            {segments.map((s) => (
              <li key={s.key} className="an-legend-item">
                <span className="an-swatch" style={{ background: s.meta.color }} />
                <span className="an-legend-label">{t(T_KEY[s.key])}</span>
                <span className="an-legend-val">{s.value} · {s.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
