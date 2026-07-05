import { useEffect, useMemo, useState } from "react";

// Stylized 7-province layout (west -> east). Not geographically exact;
// recognizable Nepal shape, upgradeable to real GeoJSON boundaries later.
const PROVINCES = {
  Sudurpashchim: "M20,120 L150,90 L175,200 L150,300 L40,300 L20,200 Z",
  Karnali:       "M150,90 L340,70 L360,210 L175,200 Z",
  Lumbini:       "M175,200 L360,210 L390,340 L200,360 L150,300 Z",
  Gandaki:       "M360,210 L520,150 L560,250 L420,300 L390,340 Z",
  Bagmati:       "M520,150 L660,160 L690,280 L560,290 L560,250 Z",
  Koshi:         "M660,160 L900,120 L940,300 L740,320 L690,280 Z",
  Madhesh:       "M420,300 L560,290 L690,280 L740,320 L720,400 L440,410 L390,340 L200,360 Z",
};

// Approx label anchor points (centre-ish of each region).
const LABELS = {
  Sudurpashchim: [88, 205], Karnali: [255, 145], Lumbini: [270, 285],
  Gandaki: [460, 240], Bagmati: [600, 225], Koshi: [800, 220], Madhesh: [540, 355],
};

function shade(count, max) {
  if (count === 0) return "#EDE7DD";               // empty = neutral parchment
  const t = max > 0 ? count / max : 0;             // 0..1
  // interpolate parchment -> crimson
  const a = [237, 231, 221], b = [220, 20, 60];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * (0.35 + 0.65 * t)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export default function MapModal({ open, promises, onProvinceClick, onClose }) {
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Count promises per province. "Federal" promises are national (not on the map).
  const counts = useMemo(() => {
    const m = {};
    for (const name of Object.keys(PROVINCES)) m[name] = 0;
    let federal = 0;
    for (const p of promises) {
      if (p.province && m[p.province] !== undefined) m[p.province]++;
      else federal++;
    }
    return { m, federal };
  }, [promises]);

  if (!open) return null;

  const max = Math.max(1, ...Object.values(counts.m));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="tl-title">Promises by province</h2>
        <p className="tl-sub">
          Darker = more promises tracked. National ("Federal") promises: {counts.federal}.
        </p>

        <div className="map-wrap">
          <svg viewBox="0 0 960 440" className="map-svg" role="img" aria-label="Map of Nepal provinces">
            {Object.entries(PROVINCES).map(([name, d]) => (
              <path
                key={name}
                d={d}
                fill={shade(counts.m[name], max)}
                stroke={hover === name ? "#1E3A5F" : "#fff"}
                strokeWidth={hover === name ? 3 : 1.5}
                style={{ cursor: "pointer", transition: "fill 0.15s" }}
                onMouseEnter={() => setHover(name)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onProvinceClick(name)}
              />
            ))}
            {Object.entries(LABELS).map(([name, [x, y]]) => (
              <text key={name} x={x} y={y} textAnchor="middle" className="map-label"
                    style={{ pointerEvents: "none" }}>
                {name}
                <tspan x={x} y={y + 15} className="map-count">{counts.m[name]}</tspan>
              </text>
            ))}
          </svg>
        </div>

        {hover && (
          <p className="map-hint">
            <strong>{hover}</strong>: {counts.m[hover]} promise{counts.m[hover] === 1 ? "" : "s"} — click to view
          </p>
        )}
      </div>
    </div>
  );
}
