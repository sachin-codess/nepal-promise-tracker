import { CATEGORIES } from "../data/demoData";

export default function Controls({ search, setSearch, category, setCategory, status, setStatus }) {
  return (
    <div className="controls">
      <input
        className="search"
        type="search"
        placeholder="Search a politician, promise, or party…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search promises"
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
        ))}
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
        <option value="all">All statuses</option>
        <option value="kept">Kept</option>
        <option value="broken">Broken</option>
        <option value="in_progress">In progress</option>
      </select>
    </div>
  );
}
