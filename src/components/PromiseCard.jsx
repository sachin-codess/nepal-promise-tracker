import StatusPennant from "./StatusPennant";
import BudgetBar from "./BudgetBar";
import { useT, useCat, useDate, useNe } from "../lib/i18n";

export default function PromiseCard({ p, onPartyClick, onPoliticianClick, eventCount = 0, onTimelineClick }) {
  const t = useT();
  const cat = useCat();
  const fmtDate = useDate();
  const ne = useNe();
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

      <p className="card-promise">“{ne(p, "promise")}”</p>

      <div className="card-dates">
        <span className="chip">{cat(p.category)}</span>
        {p.date_made && <span>{t("promised")} {fmtDate(p.date_made)}</span>}
        {p.deadline && <span>{t("deadline")} {fmtDate(p.deadline)}</span>}
      </div>

      {p.evidence && <p className="card-evidence">{ne(p, "evidence")}</p>}

      <BudgetBar p={p} />

      {p.source_url && (
        <a className="card-source" href={p.source_url} target="_blank" rel="noreferrer">
          {t("viewSource")}
        </a>
      )}

      {eventCount > 0 && (
        <div>
          <button className="card-timeline-btn" onClick={() => onTimelineClick && onTimelineClick(p)}>
            {t("viewTimeline")} ({eventCount}) →
          </button>
        </div>
      )}
    </article>
  );
}
