import { useEffect, useMemo, useState } from "react";
import { PROVINCE_PATHS } from "./provincePaths";
import { useT, useProv } from "../lib/i18n";

// Real Nepal province boundaries (source: mesaugat/geoJSON-Nepal, ADM1 2017),
// projected + simplified to an 800x400 SVG. Keyed by province name.
const PROVINCES = PROVINCE_PATHS;

// Label anchor points, computed from each province's real interior point.
const LABELS = {
  Sudurpashchim: [138.2, 114.4],
  Karnali: [265.0, 116.4],
  Lumbini: [268.9, 227.6],
  Gandaki: [392.3, 201.2],
  Bagmati: [503.0, 269.0],
  Koshi: [648.5, 308.2],
  Madhesh: [520.5, 334.9],
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
  const t = useT();
  const prov = useProv();
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
        <button className="modal-close" onClick={onClose} aria-label={t("close")}>×</button>
        <h2 className="tl-title">{t("promisesByProvince")}</h2>
        <p className="tl-sub">
          {t("mapLegendA")} {counts.federal}
        </p>

        <div className="map-wrap">
          <svg viewBox="0 0 800 400" className="map-svg" role="img" aria-label={t("mapAria")}>
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
                {prov(name)}
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
