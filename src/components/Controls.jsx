import { useT, useCat } from "../lib/i18n";

export default function Controls({ search, setSearch, category, setCategory, categories, status, setStatus }) {
  const t = useT();
  const cat = useCat();
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
        {categories.map((c) => (
          <option key={c} value={c}>{c === "All" ? t("allCategories") : cat(c)}</option>
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
