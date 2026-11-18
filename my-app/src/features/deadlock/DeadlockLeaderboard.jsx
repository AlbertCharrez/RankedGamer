
import { useEffect, useMemo, useState } from "react";
import "./DeadlockLeaderboard.css";

const API = "https://api.deadlock-api.com";

const REGIONS = [
  { value: "Global", label: "Global" },
  { value: "NAmerica", label: "North America" },
  { value: "Europe", label: "Europe" },
  { value: "Asia", label: "Asia" },
  { value: "SAmerica", label: "South America" },
  { value: "Oceania", label: "Oceania" },
];

const REGIONAL_VALUES = REGIONS.filter(
  (region) => region.value !== "Global"
);

async function fetchRegionLeaderboard(region, heroId = "") {
  const path = heroId
    ? `${API}/v1/leaderboard/${region}/${encodeURIComponent(heroId)}`
    : `${API}/v1/leaderboard/${region}`;

  const response = await fetch(path);

  if (!response.ok) {
    if (response.status === 429 || response.status === 503) {
      throw new Error(
        `${REGIONS.find((item) => item.value === region)?.label || region} leaderboard is busy. Please try again shortly.`
      );
    }

    throw new Error(
      `Couldn't load the ${REGIONS.find((item) => item.value === region)?.label || region} leaderboard.`
    );
  }

  const data = await response.json();

  return (Array.isArray(data?.entries) ? data.entries : []).map((entry) => ({
    ...entry,
    region,
    regionLabel:
      REGIONS.find((item) => item.value === region)?.label || region,
  }));
}

// Combines regional lists without pretending their ranks are worldwide ranks.
function combineRegionalEntries(regionLists) {
  const uniqueEntries = new Map();

  regionLists.flat().forEach((entry) => {
    const possibleIds = Array.isArray(entry.possible_account_ids)
      ? entry.possible_account_ids.map(String).sort()
      : [];

    const identity = possibleIds.length
      ? possibleIds.join("-")
      : `${entry.region}-${(entry.account_name || "unknown").toLowerCase()}`;

    const existing = uniqueEntries.get(identity);

    // If an account appears in more than one region, keep its best regional placement.
    if (
      !existing ||
      Number(entry.rank ?? Infinity) < Number(existing.rank ?? Infinity)
    ) {
      uniqueEntries.set(identity, entry);
    }
  });

  return [...uniqueEntries.values()].sort((a, b) => {
    const rankDifference =
      Number(a.rank ?? Infinity) - Number(b.rank ?? Infinity);

    if (rankDifference !== 0) return rankDifference;

    return (
      a.regionLabel.localeCompare(b.regionLabel) ||
      (a.account_name || "").localeCompare(b.account_name || "")
    );
  });
}

export default function DeadlockLeaderboard() {
  const [region, setRegion] = useState("Global");
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
        if (!cancelled) {
          setHeroList(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) setHeroList([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setLoading(true);
      setError("");

      try {
        let results;

        if (region === "Global") {
          const regionalLists = await Promise.all(
            REGIONAL_VALUES.map((item) =>
              fetchRegionLeaderboard(item.value, heroId)
            )
          );

          results = combineRegionalEntries(regionalLists);
        } else {
          results = await fetchRegionLeaderboard(region, heroId);
        }

        if (!cancelled) {
          setEntries(results);
        }
      } catch (err) {
        if (!cancelled) {
          setEntries([]);
          setError(
            err?.message || "Something went wrong loading the leaderboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [region, heroId, reloadKey]);

  const heroNames = useMemo(
    () =>
      Object.fromEntries(
        heroList.map((hero) => [String(hero.id), hero.name])
      ),
    [heroList]
  );

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();

    return entries
      .filter(
        (entry) =>
          !q || (entry.account_name || "").toLowerCase().includes(q)
      )
      .slice(0, Number(topCount));
  }, [entries, search, topCount]);

  const selectedRegionLabel =
    REGIONS.find((item) => item.value === region)?.label || region;

  return (
    <section className="deadlock-leaderboard">
      <div className="deadlock-leaderboard-heading">
        <div>
          <span className="deadlock-label">COMPETE WITH OTHERS</span>
          <h2>Deadlock Leaderboard</h2>
          <p>Browse public Deadlock rankings from around the world.</p>
        </div>

        <span className="deadlock-leaderboard-live">
          PUBLIC RANKINGS
        </span>
      </div>

      <div className="deadlock-leaderboard-filters">
        <label>
          <span>Region</span>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            {REGIONS.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Hero</span>
          <select
            value={heroId}
            onChange={(event) => setHeroId(event.target.value)}
          >
            <option value="">All heroes</option>
            {heroList.map((hero) => (
              <option value={hero.id} key={hero.id}>
                {hero.name}
              </option>
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
          <select
            value={topCount}
            onChange={(event) => setTopCount(event.target.value)}
          >
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
        for {selectedRegionLabel}.
        {region === "Global"
          ? " This combines the five regional lists. Placements shown are each player's regional ranks, not official worldwide ranks."
          : " Rankings are updated by the game periodically."}
      </p>

      {loading && (
        <div className="deadlock-leaderboard-state">
          {region === "Global"
            ? "Loading rankings from all regions..."
            : "Loading leaderboard..."}
        </div>
      )}

      {!loading && error && (
        <div className="deadlock-leaderboard-state is-error">
          {error}
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filteredEntries.length === 0 && (
        <div className="deadlock-leaderboard-state">
          {entries.length
            ? "No players match that search."
            : "No leaderboard entries were returned."}
        </div>
      )}

      {!loading && !error && filteredEntries.length > 0 && (
        <div className="deadlock-leaderboard-table-wrap">
          <table className="deadlock-leaderboard-table">
            <thead>
              <tr>
                <th>Regional place</th>
                {region === "Global" && <th>Region</th>}
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
                  <tr
                    key={`${entry.region}-${entry.rank ?? index}-${entry.account_name ?? "player"}-${index}`}
                  >
                    <td>
                      <span
                        className={`deadlock-leaderboard-place ${
                          entry.rank === 1 ? "is-first" : ""
                        }`}
                      >
                        #{entry.rank ?? index + 1}
                      </span>
                    </td>

                    {region === "Global" && (
                      <td className="deadlock-leaderboard-region">
                        {entry.regionLabel}
                      </td>
                    )}

                    <td className="deadlock-leaderboard-player-name">
                      {entry.account_name || "Unknown player"}
                    </td>

                    <td>
                      {heroLabels.length
                        ? heroLabels.join(", ")
                        : "Not available"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="deadlock-leaderboard-footnote">
        The Global view combines entries from North America, Europe, Asia,
        South America, and Oceania. Regional placements are retained because
        the API does not provide an official worldwide rank. Some entries may
        not include top-hero information.
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

        const regionalLists = await Promise.all(
          REGIONAL_VALUES.map((item) =>
            fetchRegionLeaderboard(item.value)
          )
        );

        const globalEntries = combineRegionalEntries(regionalLists);

        if (!cancelled) {
          setPlayers(globalEntries.slice(0, 3));
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setPlayers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
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
          Loading global top players...
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

      {!loading &&
        !error &&
        players.map((player, index) => (
          <div
            className="deadlock-leaderboard-player"
            key={`${player.region}-${player.account_name || "player"}-${player.rank ?? index}`}
          >
            <div
              className={`deadlock-leaderboard-rank ${
                index === 0 ? "first" : ""
              }`}
            >
              #{index + 1}
            </div>

            <div className="deadlock-leaderboard-player-info">
              <strong>{player.account_name || "Unknown player"}</strong>
              <span>{player.regionLabel} · Regional rank #{player.rank}</span>
            </div>

            <div className="deadlock-leaderboard-player-stat">
              <span>Regional place</span>
              <strong>#{player.rank ?? "—"}</strong>
            </div>
          </div>
        ))}
    </div>
  );
}
