import { useT, useMoney } from "../lib/i18n";

export default function BudgetBar({ p }) {
  const t = useT();
  const fmtMoney = useMoney();
  const allocated = p.budget_allocated;
  const spent = p.budget_spent;
  const currency = p.budget_currency || "NPR";

  // Only render if there's at least an allocated figure.
  if (allocated == null) return null;

  const pct = spent != null && allocated > 0
    ? Math.min(100, Math.round((spent / allocated) * 100))
    : null;

  return (
    <div className="budget">
      <div className="budget-row">
        <span className="budget-label">{t("budget")}</span>
        <span className="budget-figures">
          {spent != null && <strong>{fmtMoney(spent, currency)}</strong>}
          {spent != null && " / "}
          {fmtMoney(allocated, currency)}
          {pct != null && <span className="budget-pct"> ({pct}%)</span>}
        </span>
      </div>
      {pct != null && (
        <div className="budget-track" aria-hidden="true">
          <div className="budget-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      {p.budget_source_url && (
        <a className="budget-source" href={p.budget_source_url} target="_blank" rel="noreferrer">
          {t("budgetSource")}
        </a>
      )}
    </div>
  );
}
