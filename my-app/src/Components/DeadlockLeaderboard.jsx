import { useEffect, useMemo, useState } from "react";
import "./DeadlockLeaderboard.css";

const API = "/api/deadlock";
const REGIONS = [
  { value: "NAmerica", label: "North America" },
  { value: "Europe", label: "Europe" },
  { value: "Asia", label: "Asia" },
  { value: "SAmerica", label: "South America" },
  { value: "Oceania", label: "Oceania" },
];

export default function DeadlockLeaderboard() {
  const [region, setRegion] = useState("NAmerica");
  const [heroId, setHeroId] = useState("");
  const [heroList, setHeroList] = useState([]);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [topCount, setTopCount] = useState("50");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/v1/assets/heroes`)
      .then((res) => {
        if (!res.ok) throw new Error("Couldn't load the hero list.");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setHeroList(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setHeroList([]);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadLeaderboard() {
      setLoading(true);
      setError("");
      try {
        const path = heroId
          ? `${API}/v1/leaderboard/${region}/${encodeURIComponent(heroId)}`
          : `${API}/v1/leaderboard/${region}`;
        const response = await fetch(path);
        if (!response.ok) {
          if (response.status === 429 || response.status === 503) {
            throw new Error("The leaderboard is busy right now. Please try again shortly.");
          }
          throw new Error("Couldn't load the Deadlock leaderboard.");
        }
        const data = await response.json();
        if (!cancelled) {
          setEntries(Array.isArray(data?.entries) ? data.entries : []);
        }
      } catch (err) {
        if (!cancelled) {
          setEntries([]);
          setError(err.message || "Something went wrong loading the leaderboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadLeaderboard();
    return () => { cancelled = true; };
  }, [region, heroId, reloadKey]);

  const heroNames = useMemo(
    () => Object.fromEntries(heroList.map((hero) => [String(hero.id), hero.name])),
    [heroList]
  );

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries
      .filter((entry) => !q || (entry.account_name || "").toLowerCase().includes(q))
      .slice(0, Number(topCount));
  }, [entries, search, topCount]);

  return (
    <section className="deadlock-leaderboard">
      <div className="deadlock-leaderboard-heading">
        <div>
          <span className="deadlock-label">COMPETE WITH OTHERS</span>
          <h2>Deadlock Leaderboard</h2>
          <p>Browse the official regional rankings. No account required.</p>
        </div>
        <span className="deadlock-leaderboard-live">PUBLIC RANKINGS</span>
      </div>

      <div className="deadlock-leaderboard-filters">
        <label>
          <span>Region</span>
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            {REGIONS.map((item) => (
              <option value={item.value} key={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Hero</span>
          <select value={heroId} onChange={(event) => setHeroId(event.target.value)}>
            <option value="">All heroes</option>
            {heroList.map((hero) => (
              <option value={hero.id} key={hero.id}>{hero.name}</option>
            ))}
          </select>
        </label>

        <label className="deadlock-leaderboard-search">
          <span>Search player</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Enter a Steam name..."
          />
        </label>

        <label>
          <span>Show</span>
          <select value={topCount} onChange={(event) => setTopCount(event.target.value)}>
            <option value="25">Top 25</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>
        </label>
      </div>

      <p className="deadlock-leaderboard-note">
        {heroId
          ? `Showing the ${heroNames[String(heroId)] || "selected hero"} leaderboard`
          : "Showing the overall leaderboard"}{" "}
        for {REGIONS.find((item) => item.value === region)?.label}.
        Rankings are updated by the game periodically.
      </p>

      {loading && <div className="deadlock-leaderboard-state">Loading leaderboard...</div>}
      {!loading && error && (
        <div className="deadlock-leaderboard-state is-error">
          {error}
          <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}
      {!loading && !error && filteredEntries.length === 0 && (
        <div className="deadlock-leaderboard-state">
          {entries.length ? "No players match that search." : "No leaderboard entries were returned."}
        </div>
      )}

      {!loading && !error && filteredEntries.length > 0 && (
        <div className="deadlock-leaderboard-table-wrap">
          <table className="deadlock-leaderboard-table">
            <thead>
              <tr>
                <th>Place</th>
                <th>Player</th>
                <th>Top heroes</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => {
                const heroLabels = (entry.top_hero_ids || [])
                  .map((id) => heroNames[String(id)])
                  .filter(Boolean)
                  .slice(0, 3);
                return (
                  <tr key={`${entry.rank ?? index}-${entry.account_name ?? "player"}-${index}`}>
                    <td><span className={`deadlock-leaderboard-place ${entry.rank === 1 ? "is-first" : ""}`}>#{entry.rank ?? index + 1}</span></td>
                    <td className="deadlock-leaderboard-player-name">{entry.account_name || "Unknown player"}</td>
                    <td>{heroLabels.length ? heroLabels.join(", ") : "Not available"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="deadlock-leaderboard-footnote">
        Hero-specific rankings are available where the game provides hero leaderboard data.
        Some entries may not include top-hero information.
      </p>
    </section>
  );
}

export function DeadlockLeaderboardPreview() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `${API}/v1/leaderboard/NAmerica`
        );

        if (!response.ok) {
          throw new Error("Could not load leaderboard");
        }

        const data = await response.json();

        if (!cancelled) {
          setPlayers(
            Array.isArray(data?.entries)
              ? data.entries.slice(0, 3)
              : []
          );
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setPlayers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="deadlock-leaderboard-preview">
      {loading && (
        <div className="deadlock-empty-card">
          Loading top players...
        </div>
      )}

      {error && (
        <div className="deadlock-empty-card">
          Couldn't load the leaderboard preview.
        </div>
      )}

      {!loading && !error && players.length === 0 && (
        <div className="deadlock-empty-card">
          No leaderboard players are available right now.
        </div>
      )}

      {!loading && !error && players.map((player, index) => (
        <div
          className="deadlock-leaderboard-player"
          key={`${player.account_name || "player"}-${player.rank ?? index}`}
        >
          <div
            className={`deadlock-leaderboard-rank ${
              index === 0 ? "first" : ""
            }`}
          >
            #{player.rank ?? index + 1}
          </div>

          <div className="deadlock-leaderboard-player-info">
            <strong>
              {player.account_name || "Unknown player"}
            </strong>
            <span>North America leaderboard</span>
          </div>

          <div className="deadlock-leaderboard-player-stat">
            <span>Placement</span>
            <strong>#{player.rank ?? index + 1}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

