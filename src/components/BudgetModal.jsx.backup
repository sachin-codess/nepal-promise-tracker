import { useEffect, useState, useMemo } from "react";
import { fetchBudget, fetchBudgetYears } from "../lib/supabase";
import { useT } from "../lib/i18n";

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

// Full federal budget totals per year (for the note), so it stays year-accurate.
const FULL_BUDGET = {
  "2025/26": "~Rs 1.96 trillion",
  "2024/25": "~Rs 1.86 trillion",
};

export default function BudgetModal({ open, onClose }) {
  const t = useT();
  const [years, setYears] = useState([]);   // [{ad, bs}]
  const [year, setYear] = useState(null);   // AD string
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
    (async () => {
      const { data } = await fetchBudgetYears();
      if (cancelled) return;
      setYears(data);
      setYear((prev) => (prev && data.some((y) => y.ad === prev)) ? prev : (data[0]?.ad || null));
    })();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open || !year) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await fetchBudget(year);
      if (!cancelled) { setRows(data); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [open, year]);

  const total = useMemo(() => rows.reduce((s, r) => s + Number(r.amount), 0), [rows]);
  const max = useMemo(() => Math.max(1, ...rows.map((r) => Number(r.amount))), [rows]);
  const bs = useMemo(() => years.find((y) => y.ad === year)?.bs || "", [years, year]);
  const label = (y) => `${y.bs} BS (FY ${y.ad})`;

  if (!open) return null;

  const fullBudget = FULL_BUDGET[year] || "";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="tl-title">{t("budgetTitle")}</h2>

        <div className="budget-year-row">
          <label className="budget-year-label">{t("budgetYear")}:</label>
          <select
            className="budget-year-select"
            value={year || ""}
            onChange={(e) => setYear(e.target.value)}
          >
            {years.map((y) => <option key={y.ad} value={y.ad}>{label(y)}</option>)}
          </select>
          <span className="budget-total-inline">
            {t("budgetTop")} {fmtNPR(total)} <span className="usd-approx">(≈ {fmtUSD(total)})</span>
          </span>
        </div>

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

        <h3 className="exec-subhead">{t("budgetAllocatedLabel")} — {bs} BS (FY {year})</h3>

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
        <p className="nbudget-note">
          {t("budgetNoteA")} {fullBudget} {t("budgetNoteB")}
        </p>
      </div>
    </div>
  );
}
