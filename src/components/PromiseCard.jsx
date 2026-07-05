import StatusPennant from "./StatusPennant";

function fmtDate(d) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function PromiseCard({ p, onPartyClick, onPoliticianClick }) {
  return (
    <article className="card">
      <div className="card-top">
        <div>
          <div className="card-politician">
            <button className="pol-link" onClick={() => onPoliticianClick && onPoliticianClick(p.politician)}>
              {p.politician}
            </button>
          </div>
          <div className="card-meta">
            {p.position}
            {p.party ? <span className="dot-sep">·</span> : null}
            {p.party ? (
              <button className="party-link" onClick={() => onPartyClick && onPartyClick(p.party)}>
                {p.party}
              </button>
            ) : null}
          </div>
        </div>
        <StatusPennant status={p.status} />
      </div>

      <p className="card-promise">“{p.promise}”</p>

      <div className="card-dates">
        <span className="chip">{p.category}</span>
        {p.date_made && <span>Promised {fmtDate(p.date_made)}</span>}
        {p.deadline && <span>Deadline {fmtDate(p.deadline)}</span>}
      </div>

      {p.evidence && <p className="card-evidence">{p.evidence}</p>}

      {p.source_url && (
        <a className="card-source" href={p.source_url} target="_blank" rel="noreferrer">
          View source →
        </a>
      )}
    </article>
  );
}
