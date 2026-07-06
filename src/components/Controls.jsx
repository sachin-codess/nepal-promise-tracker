import { CATEGORIES } from "../data/demoData";
import { useT } from "../lib/i18n";

export default function Controls({ search, setSearch, category, setCategory, status, setStatus }) {
  const t = useT();
  return (
    <div className="controls">
      <input
        className="search"
        type="search"
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search promises"
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c === "All" ? t("allCategories") : c}</option>
        ))}
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
        <option value="all">{t("allStatuses")}</option>
        <option value="kept">{t("kept")}</option>
        <option value="broken">{t("broken")}</option>
        <option value="in_progress">{t("inProgress")}</option>
      </select>
    </div>
  );
}
