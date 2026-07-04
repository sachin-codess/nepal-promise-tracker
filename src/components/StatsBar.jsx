import { STATUS } from "./StatusPennant";

export default function StatsBar({ promises }) {
  const counts = { kept: 0, broken: 0, in_progress: 0 };
  for (const p of promises) {
    if (counts[p.status] !== undefined) counts[p.status]++;
  }
  const total = promises.length;

  return (
    <div className="stats" role="group" aria-label="Promise statistics">
      <div className="stat">
        <div className="stat-num">{total}</div>
        <div className="stat-label">Promises tracked</div>
      </div>
      {Object.entries(STATUS).map(([key, s]) => (
        <div className="stat" key={key}>
          <div className="stat-num" style={{ color: s.color }}>
            {counts[key]}
          </div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
