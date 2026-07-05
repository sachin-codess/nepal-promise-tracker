import { useEffect } from "react";

/* AboutModal — mission + methodology. Builds public trust. */
export default function AboutModal({ open, onClose }) {
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
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <h2 id="about-title" className="modal-title">
          About <span className="devanagari">वाचा</span>
        </h2>

        <p className="modal-lead">
          An independent platform that helps citizens track government promises
          with evidence and a transparent, consistent methodology.
        </p>

        <section className="modal-section">
          <h3>Our mission</h3>
          <p>
            Political promises are easy to make and easy to forget. This project
            keeps a public, sourced record of what Nepal's political figures have
            promised and what has actually been delivered — so citizens,
            journalists, students, and researchers can hold power to account with
            facts rather than memory.
          </p>
        </section>

        <section className="modal-section">
          <h3>How we classify a promise</h3>
          <p>Every promise is given one of three statuses:</p>
          <ul className="modal-status-list">
            <li>
              <span className="chip chip-kept">Kept</span>
              The promise has been officially fulfilled, confirmed by official
              documentation or proof of completion.
            </li>
            <li>
              <span className="chip chip-progress">In progress</span>
              Work has visibly started or partial action has been taken, but the
              promise is not yet officially complete. This is also our default
              when the evidence is unclear or disputed — we do not mark something
              broken without solid grounds.
            </li>
            <li>
              <span className="chip chip-broken">Broken</span>
              The deadline has passed with no fulfillment, or the responsible
              party has explicitly abandoned or reversed the commitment.
            </li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>Our evidence standard</h3>
          <p>
            Every entry must be backed by a public source. We rely on official
            government and court documents and reporting from reputable news
            outlets. Where sources conflict, we favour official records and note
            the uncertainty rather than pick a side.
          </p>
        </section>

        <section className="modal-section">
          <h3>How we stay fair</h3>
          <ul className="modal-bullets">
            <li>Promises are worded neutrally, in plain language, without spin.</li>
            <li>We cover parties across the spectrum, not one side.</li>
            <li>Status reflects documented outcomes, not opinions or intentions.</li>
            <li>When evidence is thin, we stay conservative rather than accuse.</li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>Corrections</h3>
          <p>
            We may get things wrong. If you spot an error or have a source that
            changes a status, please report it and we will review it. Accuracy
            matters more to us than being right the first time.
          </p>
        </section>

        <section className="modal-section modal-disclaimer">
          <h3>What this is not</h3>
          <p>
            This is an independent project. It is not affiliated with, funded by,
            or endorsed by any political party, candidate, or government body. It
            exists to inform — not to campaign for or against anyone.
          </p>
        </section>
      </div>
    </div>
  );
}
