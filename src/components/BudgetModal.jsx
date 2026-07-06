import { useEffect, useState, useMemo } from "react";
import { fetchBudget } from "../lib/supabase";
import { useT } from "../lib/i18n";

// Format NPR into Arba (billion) / Crore for Nepali readability.
// Approx USD rate (July 2026). Update as needed; shown transparently in the UI.
const NPR_PER_USD = 152;
function fmtUSD(nprAmount) {
  const usd = nprAmount / NPR_PER_USD;
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`;
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`;
  return `$${Math.round(usd).toLocaleString()}`;
}

function fmtNPR(amount) {
  if (amount >= 1e9) return `Rs ${(amount / 1e9).toFixed(1)} Arba`;
  if (amount >= 1e7) return `Rs ${(amount / 1e7).toFixed(1)} Crore`;
  return `Rs ${amount.toLocaleString()}`;
}

export default function BudgetModal({ open, onClose }) {
  const t = useT();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await fetchBudget("2025/26");
      if (!cancelled) { setRows(data); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [open]);

  const total = useMemo(() => rows.reduce((s, r) => s + Number(r.amount), 0), [rows]);
  const max = useMemo(() => Math.max(1, ...rows.map((r) => Number(r.amount))), [rows]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="tl-title">{t("budgetTitle")}</h2>
        <p className="tl-sub">
          {t("budgetYear")} 2025/26 · {t("budgetTop")} {fmtNPR(total)} <span className="usd-approx">(≈ {fmtUSD(total)} at ~Rs {NPR_PER_USD}/$)</span>
        </p>

        <div className="exec-panel">
          <h3 className="exec-title">{t("execTitle")}</h3>
          <p className="exec-intro">{t("execIntro")}</p>
          <ul className="exec-facts">
            <li>{t("execFact1")}</li>
            <li>{t("execFact2")}</li>
            <li>{t("execFact3")}</li>
          </ul>
          <a className="nbudget-src" href="https://kathmandupost.com/money/2026/05/28/nepal-s-rising-budgets-fail-to-translate-into-revenue-spending-and-growth-gains" target="_blank" rel="noreferrer">{t("budgetSource")}</a>
        </div>

        <h3 className="exec-subhead">{t("budgetAllocatedLabel")}</h3>

        {loading ? (
          <p className="empty">…</p>
        ) : (
          <ul className="nbudget-list">
            {rows.map((r) => {
              const amt = Number(r.amount);
              const pct = Math.round((amt / max) * 100);
              const share = total ? ((amt / total) * 100).toFixed(1) : 0;
              return (
                <li key={r.id} className="nbudget-item">
                  <div className="nbudget-top">
                    <span className="nbudget-sector">{r.sector}</span>
                    <span className="nbudget-amt">{fmtNPR(amt)} <span className="nbudget-share">({share}%)</span></span>
                  </div>
                  <div className="nbudget-track" aria-hidden="true">
                    <div className="nbudget-fill" style={{ width: `${pct}%` }} />
                  </div>
                  {r.source_url && (
                    <a className="nbudget-src" href={r.source_url} target="_blank" rel="noreferrer">{t("budgetSource")}</a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="nbudget-note">{t("budgetNote")}</p>
      </div>
    </div>
  );
}
