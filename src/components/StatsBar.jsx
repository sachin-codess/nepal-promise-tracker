import { STATUS } from "./StatusPennant";
import { useT } from "../lib/i18n";

export default function StatsBar({ promises, status, setStatus }) {
  const t = useT();
  const counts = { kept: 0, broken: 0, in_progress: 0 };
  for (const p of promises) {
    if (counts[p.status] !== undefined) counts[p.status]++;
  }
  const total = promises.length;

  // Click a card to filter by that status; click the active one again to reset.
  const pick = (key) => setStatus(status === key ? "all" : key);

  return (
    <div className="stats" role="group" aria-label="Promise statistics">
      <button
        type="button"
        className={"stat" + (status === "all" ? " stat-active" : "")}
        onClick={() => setStatus("all")}
      >
        <div className="stat-num">{total}</div>
        <div className="stat-label">{t("promisesTracked")}</div>
      </button>
      {Object.entries(STATUS).map(([key, s]) => (
        <button
          type="button"
          className={"stat" + (status === key ? " stat-active" : "")}
          key={key}
          onClick={() => pick(key)}
        >
          <div className="stat-num" style={{ color: s.color }}>
            {counts[key]}
          </div>
          <div className="stat-label">{t(s.key)}</div>
        </button>
      ))}
    </div>
  );
}
