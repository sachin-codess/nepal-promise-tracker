import { useEffect, useState } from "react";
import { useT, useLang, useCat, fmtDate } from "../lib/i18n";

const EV_META = {
  start:      { color: "#1E3A5F", key: "projStart" },
  delay:      { color: "#B3261E", key: "projDelay" },
  revision:   { color: "#B3261E", key: "projRevision" },
  progress:   { color: "#C77D00", key: "projProgressEv" },
  completion: { color: "#1B7A3D", key: "projCompletion" },
};

const STATUS_KEY = {
  planned: "stPlanned",
  in_progress: "stInProgress",
  stalled: "stStalled",
  completed: "stCompleted",
  abandoned: "stAbandoned",
};


// Rs 213,000,000,000 -> "Rs 213 Arba". Matches the convention used elsewhere.
function fmtNpr(n) {
  if (n == null) return "\u2014";
  return "Rs " + Math.round(n / 1e9) + " Arba";
}

// Whole years between two dates. This is the accountability number.
function yearsBetween(a, b) {
  if (!a || !b) return null;
  const ms = new Date(b) - new Date(a);
  return Math.round((ms / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10;
}

export default function ProjectsModal({ open, onClose, projects, milestones, loading }) {
  const t = useT();
  const cat = useCat();
  const { lang } = useLang();
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={t("close")}>&times;</button>

        <h2 className="modal-title">{t("projectsTitle")}</h2>
        <p className="modal-lead">{t("projectsLead")}</p>

        {loading ? (
          <p className="empty">{t("projLoading")}</p>
        ) : projects.length === 0 ? (
          <p className="empty">{t("projEmpty")}</p>
        ) : (
          projects.map((p) => {
            const name = lang === "ne" && p.name_ne ? p.name_ne : p.name;
            const slip = yearsBetween(p.original_deadline, p.current_deadline);
            const evs = milestones.filter((m) => m.project_id === p.id);
            const isOpen = openId === p.id;
            const pct = p.physical_progress_pct ?? 0;

            return (
              <section className="proj-card" key={p.id}>
                <div className="proj-head">
                  <h3 className="proj-name">{name}</h3>
                  <span className={"chip chip-" + (p.status === "completed" ? "kept" : p.status === "stalled" || p.status === "abandoned" ? "broken" : "progress")}>
                    {t(STATUS_KEY[p.status] ?? "stInProgress")}
                  </span>
                </div>

                {p.sector && <span className="chip">{cat(p.sector)}</span>}
                {p.description && <p className="proj-desc">{p.description}</p>}

                {/* The slippage line — the whole point of this feature. */}
                {slip != null && slip > 0 && (
                  <p className="proj-slip">
                    <strong>{t("projSlipped")} {slip} {t("projYears")}</strong>
                    {" \u2014 "}
                    {t("projOriginal")} {fmtDate(p.original_deadline, lang)}
                    {", "}
                    {t("projCurrent")} {fmtDate(p.current_deadline, lang)}
                  </p>
                )}

                <div className="proj-meta">
                  <div className="proj-bar-row">
                    <span className="proj-label">{t("projProgress")}</span>
                    <span className="proj-val">{pct}%</span>
                  </div>
                  <div className="proj-bar">
                    <div className="proj-bar-fill" style={{ width: pct + "%" }} />
                  </div>

                  <div className="proj-bar-row">
                    <span className="proj-label">{t("projBudget")}</span>
                    <span className="proj-val">
                      {fmtNpr(p.budget_spent)} / {fmtNpr(p.budget_allocated)}
                    </span>
                  </div>

                  {p.implementing_agency && (
                    <div className="proj-bar-row">
                      <span className="proj-label">{t("projAgency")}</span>
                      <span className="proj-val">{p.implementing_agency}</span>
                    </div>
                  )}
                </div>

                {evs.length > 0 && (
                  <>
                    <button
                      className="proj-toggle"
                      onClick={() => setOpenId(isOpen ? null : p.id)}
                    >
                      {t("projTimeline")} ({evs.length}) {isOpen ? "\u2191" : "\u2193"}
                    </button>

                    {isOpen && (
                      <ol className="tl-list">
                        {evs.map((ev) => {
                          const meta = EV_META[ev.event_type] || EV_META.progress;
                          return (
                            <li className="tl-item" key={ev.id}>
                              <span className="tl-dot" style={{ background: meta.color }} />
                              <div className="tl-body">
                                <div className="tl-row">
                                  <span className="tl-date">{fmtDate(ev.event_date, lang)}</span>
                                  <span className="tl-tag" style={{ color: meta.color, borderColor: meta.color }}>
                                    {t(meta.key)}
                                  </span>
                                </div>
                                <div className="tl-event-title">{ev.title}</div>
                                {ev.description && <p className="tl-desc">{ev.description}</p>}
                                {ev.source_url && (
                                  <a className="tl-source" href={ev.source_url} target="_blank" rel="noreferrer">
                                    {t("projSource")}
                                  </a>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </>
                )}

                {p.source_url && (
                  <a className="tl-source" href={p.source_url} target="_blank" rel="noreferrer">
                    {t("projSource")}
                  </a>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
