import { useEffect, useState } from "react";
import { fetchMatchHistory, fetchHeroes, summarize, isWin } from "../Data/deadlock";
import MatchSpotlight from "./MatchSpotlight";

const formatDuration = (s = 0) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const formatDate = (unix) =>
  unix ? new Date(unix * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";

export default function DeadlockStats({ steamId, recentCount = 5 }) {
  const [state, setState] = useState({ status: "loading" });
  const [selectedId, setSelectedId] = useState(null); // null = newest match

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    setSelectedId(null);

    Promise.all([fetchMatchHistory(steamId), fetchHeroes()])
      .then(([matches, heroes]) => !cancelled && setState({ status: "ready", matches, heroes }))
      .catch((err) => !cancelled && setState({ status: "error", message: err.message }));

    return () => {
      cancelled = true;
    };
  }, [steamId]);

  if (state.status === "loading") return <div className="stats-card muted">Loading Deadlock stats...</div>;
  if (state.status === "error") return <div className="stats-card form-error">{state.message}</div>;

  const { matches, heroes } = state;
  const heroName = (id) => heroes[id]?.name ?? `Hero ${id}`;

  if (matches.length === 0) {
    return (
      <div className="stats-card muted">
        No Deadlock matches found for this account yet. New matches can take a while to show up.
      </div>
    );
  }

  const s = summarize(matches);
  const recent = matches.slice(0, recentCount);
  const selected = recent.find((m) => m.match_id === selectedId) ?? recent[0];

  return (
    <div className="stats-card">
      <p className="stats-caption">Last {s.played} matches</p>

      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{s.wins}–{s.losses}</span>
          <span className="stat-label">Win / Loss</span>
        </div>
        <div className="stat">
          <span className="stat-value">{s.winRate}%</span>
          <span className="stat-label">Win rate</span>
        </div>
        <div className="stat">
          <span className="stat-value">{s.kills} / {s.deaths} / {s.assists}</span>
          <span className="stat-label">Avg K / D / A</span>
        </div>
        {s.topHeroId && (
          <div className="stat">
            <span className="stat-value">{heroName(s.topHeroId)}</span>
            <span className="stat-label">Most played ({s.topHeroGames})</span>
          </div>
        )}
      </div>

      <p className="stats-caption">{selected === recent[0] ? "Latest match" : "Selected match"}</p>
      <MatchSpotlight steamId={steamId} match={selected} heroes={heroes} />

      <p className="stats-caption">Recent matches · click one for details</p>
      <ul className="match-list">
        {recent.map((m) => {
          const won = isWin(m);
          const active = m.match_id === selected.match_id;
          return (
            <li key={m.match_id}>
              <button
                type="button"
                className={`match-row ${won ? "win" : "loss"}${active ? " active" : ""}`}
                onClick={() => setSelectedId(m.match_id)}
              >
                <span className="match-result">{won ? "W" : "L"}</span>
                <span className="match-hero">
                  {heroes[m.hero_id]?.icon && <img className="match-hero-icon" src={heroes[m.hero_id].icon} alt="" />}
                  {heroName(m.hero_id)}
                </span>
                <span>{m.player_kills ?? 0} / {m.player_deaths ?? 0} / {m.player_assists ?? 0}</span>
                <span className="muted">{formatDuration(m.match_duration_s)}</span>
                <span className="muted">{formatDate(m.start_time)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}