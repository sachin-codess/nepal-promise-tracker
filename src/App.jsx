import { useState, useEffect, useMemo } from "react";
import { fetchPromises, isLiveDatabase } from "./lib/supabase";
import StatsBar from "./components/StatsBar";
import Controls from "./components/Controls";
import PromiseCard from "./components/PromiseCard";

export default function App() {
  const [promises, setPromises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("all");

  // Load data once when the app opens.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await fetchPromises();
      if (cancelled) return;
      if (error) setLoadError(error.message);
      setPromises(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Apply search + filters. Recomputed only when inputs change.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return promises.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (status !== "all" && p.status !== status) return false;
      if (q) {
        const hay = `${p.politician} ${p.promise} ${p.party ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [promises, search, category, status]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-flag" aria-hidden="true">
          <svg width="26" height="38" viewBox="0 0 26 38">
            <path d="M2 0 L24 9 L2 18 Z" fill="#DC143C" stroke="#1E3A5F" strokeWidth="2" />
            <path d="M2 17 L24 27 L2 37 Z" fill="#DC143C" stroke="#1E3A5F" strokeWidth="2" />
          </svg>
        </div>
        <div>
          <h1>Nepal Promise Tracker <span className="devanagari">वाचा</span></h1>
          <p className="tagline">
            What was promised. What was delivered. With sources.
          </p>
        </div>
      </header>

      {!isLiveDatabase && (
        <div className="demo-banner">
          <strong>Demo mode.</strong> Showing fictional sample data — these are not
          real politicians or real promises. Connect Supabase and add sourced
          entries to go live (see README).
        </div>
      )}

      {loadError && (
        <div className="error-banner">
          Couldn't load from the database: {loadError}. Check your Supabase keys
          in .env and that seed.sql has been run.
        </div>
      )}

      <StatsBar promises={promises} />

      <Controls
        search={search} setSearch={setSearch}
        category={category} setCategory={setCategory}
        status={status} setStatus={setStatus}
      />

      {loading ? (
        <p className="empty">Loading promises…</p>
      ) : visible.length === 0 ? (
        <p className="empty">
          No promises match. Clear the search or filters to see everything.
        </p>
      ) : (
        <main className="grid">
          {visible.map((p) => <PromiseCard key={p.id} p={p} />)}
        </main>
      )}

      <footer className="footer">
        Every entry requires a public source. Statuses reflect documented
        outcomes, not opinions. Built to inform, not to campaign.
      </footer>
    </div>
  );
}
