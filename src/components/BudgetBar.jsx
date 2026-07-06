import { useT } from "../lib/i18n";

// Format a raw number into a readable budget string.
// NPR uses Arba (1 Arba = 1,000,000,000) and Crore (10,000,000), how Nepalis read large sums.
// USD uses B (billion) and M (million).
function fmtMoney(amount, currency) {
  if (amount == null) return null;
  if (currency === "USD") {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(amount % 1e9 === 0 ? 0 : 1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(amount % 1e6 === 0 ? 0 : 1)}M`;
    return `$${amount.toLocaleString()}`;
  }
  // Default NPR
  if (amount >= 1e9) return `Rs ${(amount / 1e9).toFixed(amount % 1e9 === 0 ? 0 : 1)} Arba`;
  if (amount >= 1e7) return `Rs ${(amount / 1e7).toFixed(1)} Crore`;
  return `Rs ${amount.toLocaleString()}`;
}

export default function BudgetBar({ p }) {
  const t = useT();
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
