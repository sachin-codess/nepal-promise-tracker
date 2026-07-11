import { useEffect } from "react";
import { useT } from "../lib/i18n";

/* AboutModal — mission + methodology. Builds public trust. */
export default function AboutModal({ open, onClose }) {
  const t = useT();

  // Close on Escape key.
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
        aria-labelledby="about-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={t("close")}>×</button>

        <h2 id="about-title" className="modal-title">
          {t("aboutTitle")} <span className="devanagari">वाचा</span>
        </h2>

        <p className="modal-lead">{t("aboutLead")}</p>

        <section className="modal-section">
          <h3>{t("missionH")}</h3>
          <p>{t("missionP")}</p>
        </section>

        <section className="modal-section">
          <h3>{t("classifyH")}</h3>
          <p>{t("classifyP")}</p>
          <ul className="modal-status-list">
            <li>
              <span className="chip chip-kept">{t("kept")}</span>
              {" "}{t("keptDef")}
            </li>
            <li>
              <span className="chip chip-progress">{t("inProgress")}</span>
              {" "}{t("progressDef")}
            </li>
            <li>
              <span className="chip chip-broken">{t("broken")}</span>
              {" "}{t("brokenDef")}
            </li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>{t("evidenceH")}</h3>
          <p>{t("evidenceP")}</p>
        </section>

        <section className="modal-section">
          <h3>{t("fairH")}</h3>
          <ul className="modal-bullets">
            <li>{t("fair1")}</li>
            <li>{t("fair2")}</li>
            <li>{t("fair3")}</li>
            <li>{t("fair4")}</li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>{t("correctionsH")}</h3>
          <p>{t("correctionsP")}</p>
        </section>

        <section className="modal-section modal-disclaimer">
          <h3>{t("notH")}</h3>
          <p>{t("notP")}</p>
        </section>
      </div>
    </div>
  );
}
