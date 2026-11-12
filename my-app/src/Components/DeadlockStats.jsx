import { useEffect, useState } from "react";
import { fetchMatchHistory, fetchHeroNames, summarize, isWin } from "../Data/deadlock";

const formatDuration = (s = 0) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const formatDate = (unix) =>
  unix ? new Date(unix * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";

export default function DeadlockStats({ steamId, recentCount = 5 }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    Promise.all([fetchMatchHistory(steamId), fetchHeroNames()])
      .then(([matches, heroes]) => !cancelled && setState({ status: "ready", matches, heroes }))
      .catch((err) => !cancelled && setState({ status: "error", message: err.message }));

    return () => {
      cancelled = true; // ignore results if the player changed while loading
    };
  }, [steamId]);

  if (state.status === "loading") return <div className="stats-card muted">Loading Deadlock stats...</div>;
  if (state.status === "error") return <div className="stats-card form-error">{state.message}</div>;

  const { matches, heroes } = state;
  const heroName = (id) => heroes[id] ?? `Hero ${id}`;

  if (matches.length === 0) {
    return (
      <div className="stats-card muted">
        No Deadlock matches found for this account yet. New matches can take a while to show up.
      </div>
    );
  }

  const s = summarize(matches);

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

      <p className="stats-caption">Recent matches</p>
      <ul className="match-list">
        {matches.slice(0, recentCount).map((m) => {
          const won = isWin(m);
          return (
            <li key={m.match_id} className={won ? "match-row win" : "match-row loss"}>
              <span className="match-result">{won ? "W" : "L"}</span>
              <span className="match-hero">{heroName(m.hero_id)}</span>
              <span>{m.player_kills ?? 0} / {m.player_deaths ?? 0} / {m.player_assists ?? 0}</span>
              <span className="muted">{formatDuration(m.match_duration_s)}</span>
              <span className="muted">{formatDate(m.start_time)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}