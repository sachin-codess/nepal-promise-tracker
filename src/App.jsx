import { useState, useEffect, useMemo } from "react";
import { useLang, useT } from "./lib/i18n";
import { fetchPromises, fetchEvents, isLiveDatabase, fetchProjects, fetchMilestones } from "./lib/supabase";
import StatsBar from "./components/StatsBar";
import Controls from "./components/Controls";
import PromiseCard from "./components/PromiseCard";
import AboutModal from "./components/AboutModal";
import PartyModal from "./components/PartyModal";
import PoliticianModal from "./components/PoliticianModal";
import TimelineModal from "./components/TimelineModal";
import AnalyticsModal from "./components/AnalyticsModal";
import MapModal from "./components/MapModal";
import BudgetModal from "./components/BudgetModal";
import ProjectsModal from "./components/ProjectsModal";

export default function App() {
  const [promises, setPromises] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("all");
  const [showAbout, setShowAbout] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [projLoading, setProjLoading] = useState(true);
  const { lang, setLang } = useLang();
  const t = useT();
  const [province, setProvince] = useState("all");
  const [activeParty, setActiveParty] = useState(null);
  const [activePolitician, setActivePolitician] = useState(null);
  const [timelinePromise, setTimelinePromise] = useState(null);

  // Load data once when the app opens.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await fetchPromises();
      if (cancelled) return;
      if (error) setLoadError(error.message);
      setPromises(data);
      setLoading(false);
      // Events load separately; the app works fine even if this is empty.
      const ev = await fetchEvents();
      if (!cancelled && ev.data) setEvents(ev.data);
      // Mega-projects load separately too.
      const pr = await fetchProjects();
      if (!cancelled && pr.data) setProjects(pr.data);
      const ms = await fetchMilestones();
      if (!cancelled && ms.data) setMilestones(ms.data);
      if (!cancelled) setProjLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Count events per promise, so cards know whether to show the button.
  const eventCounts = useMemo(() => {
    const m = {};
    for (const e of events) m[e.promise_id] = (m[e.promise_id] || 0) + 1;
    return m;
  }, [events]);

  // Events for the promise whose timeline is open.
  const timelineEvents = useMemo(() => {
    if (!timelinePromise) return [];
    return events.filter((e) => e.promise_id === timelinePromise.id);
  }, [events, timelinePromise]);

  // Apply search + filters. Recomputed only when inputs change.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return promises.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (status !== "all" && p.status !== status) return false;
      if (province !== "all" && p.province !== province) return false;
      if (q) {
        const hay = `${p.politician} ${p.promise} ${p.party ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [promises, search, category, status, province]);

  // Unique categories present in the data, for the filter dropdown.
  const categories = useMemo(() => {
    const set = [...new Set(promises.map((p) => p.category).filter(Boolean))];
    set.sort((a, b) => a.localeCompare(b));
    return ["All", ...set];
  }, [promises]);

  // Unique parties present in the data, for the menu.
  const parties = useMemo(() => {
    const seen = new Map();
    for (const p of promises) {
      if (p.party && !seen.has(p.party)) {
        seen.set(p.party, { name: p.party, color: p.party_color || "#1E3A5F", abbr: p.party_abbr || "" });
      }
    }
    return [...seen.values()];
  }, [promises]);

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
            {t("tagline")}
          </p>
        </div>
        <div className="header-actions">
          <button className="lang-btn" onClick={() => setLang(lang === "en" ? "ne" : "en")}>
            {lang === "en" ? "ने" : "EN"}
          </button>
          <button className="map-btn" onClick={() => setShowMap(true)}>
            {t("map")}
          </button>
          <button className="map-btn" onClick={() => setShowBudget(true)}>
            {t("budgetBtn")}
          </button>
          <button className="map-btn" onClick={() => setShowProjects(true)}>
            {t("projectsBtn")}
          </button>
          <button className="analytics-btn" onClick={() => setShowAnalytics(true)}>
            {t("analytics")}
          </button>
          <button className="about-btn" onClick={() => setShowAbout(true)}>
            {t("about")}
          </button>
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

      <StatsBar promises={promises} status={status} setStatus={setStatus} />

      {parties.length > 0 && (
        <div className="party-menu">
          <span className="party-menu-label">{t("parties")}</span>
          {parties.map((pt) => (
            <button
              key={pt.name}
              className="party-chip"
              style={{ borderLeftColor: pt.color }}
              onClick={() => setActiveParty(pt.name)}
            >
              {pt.abbr || pt.name}
            </button>
          ))}
        </div>
      )}

      <Controls
        search={search} setSearch={setSearch}
        category={category} setCategory={setCategory} categories={categories}
        status={status} setStatus={setStatus}
      />

      {province !== "all" && (
        <div className="province-banner">
          {t("showingProvince")} <strong>{province}</strong> {t("province")}
          <button className="province-clear" onClick={() => setProvince("all")}>{t("clear")}</button>
        </div>
      )}

      {loading ? (
        <p className="empty">{t("loading")}</p>
      ) : visible.length === 0 ? (
        <p className="empty">{t("noMatch")}</p>
      ) : (
        <main className="grid">
          {visible.map((p) => (
            <PromiseCard
              key={p.id}
              p={p}
              onPartyClick={setActiveParty}
              onPoliticianClick={setActivePolitician}
              eventCount={eventCounts[p.id] || 0}
              onTimelineClick={setTimelinePromise}
            />
          ))}
        </main>
      )}

      <footer className="footer">
        {t("footer")}
        {" "}
        <a className="api-link" href="/api/v1" target="_blank" rel="noreferrer">
          {t("apiLink")} →
        </a>
      </footer>

      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
      <PartyModal party={activeParty} promises={promises} onClose={() => setActiveParty(null)} />
      <PoliticianModal politician={activePolitician} promises={promises} onClose={() => setActivePolitician(null)} />
      <TimelineModal promise={timelinePromise} events={timelineEvents} onClose={() => setTimelinePromise(null)} />
      <AnalyticsModal open={showAnalytics} promises={promises} onClose={() => setShowAnalytics(false)} />
      <MapModal open={showMap} promises={promises} onProvinceClick={(name) => { setProvince(name); setShowMap(false); }} onClose={() => setShowMap(false)} />
      <BudgetModal open={showBudget} onClose={() => setShowBudget(false)} />
      <ProjectsModal
        open={showProjects}
        onClose={() => setShowProjects(false)}
        projects={projects}
        milestones={milestones}
        loading={projLoading}
      />
    </div>
  );
}
