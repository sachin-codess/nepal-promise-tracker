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
          <img src="/nepal-flag.svg" alt="Flag of Nepal" width="30" height="37" style={{ display: "block" }} />
        </div>
        <div className="header-logo" aria-hidden="true">
          <svg width="40" height="30" viewBox="0 0 110 90">
            <path d="M14 46 C14 22 44 22 52 46" fill="none" stroke="#003893" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M52 46 L64 78 L102 14" fill="none" stroke="#DC143C" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
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
