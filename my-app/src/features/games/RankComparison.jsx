import { useEffect, useState } from "react";
import {
  fetchMatchHistory,
  fetchComparison,
  findComparisonBadge,
  matchType,
  percentileOf,
  COMPARE_METRICS,
  COMPARE_DAYS,
  PLAYER_DAYS,
} from "../deadlock/deadlock";

const SOLID_SAMPLE = 10; // below this, numbers are labelled an early estimate

const formatValue = (v, metric) => {
  if (metric.percent) return `${(v <= 1 ? v * 100 : v).toFixed(1)}%`;
  return v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1);
};

export default function RankComparison({ steamId, refreshKey = 0 }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    (async () => {
      try {
        // 1. does the player have any Competitive matches recently?
        const history = await fetchMatchHistory(steamId);
        const since = Date.now() / 1000 - PLAYER_DAYS * 86400;
        const rankedCount = history.filter(
          (m) => matchType(m) === "ranked" && (m.start_time ?? 0) >= since
        ).length;

        if (rankedCount === 0) {
          if (!cancelled) setState({ status: "noranked" });
          return;
        }

        // 2. what skill level do we compare against?
        const target = await findComparisonBadge(steamId, history);

        // 3. the player's averages + that skill level's distribution
        const { group, player, noRank, widened, busy } = await fetchComparison(steamId, target?.badge);
        if (noRank) {
          if (!cancelled) setState({ status: "norank" });
          return;
        }
        if (busy) {
          if (!cancelled) setState({ status: "busy" });
          return;
        }

        // 4. place the player within the group for each stat
        const rows = COMPARE_METRICS.map((metric) => {
          const you = player?.[metric.key]?.avg;
          const dist = group?.[metric.key];
          let pct = percentileOf(you, dist);
          if (pct == null) return null;
          if (metric.lowerIsBetter) pct = 100 - pct; // "better than X%" either way
          return { ...metric, you, median: dist?.percentile50, better: Math.round(pct) };
        }).filter(Boolean);

        if (!cancelled) setState({ status: "ready", target, rows, rankedCount, widened });
      } catch (err) {
        if (!cancelled) setState({ status: "error", message: err.message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [steamId, refreshKey]);

  if (state.status === "loading") {
    return <div className="stats-card muted">Comparing to players at this rank...</div>;
  }
  if (state.status === "error") {
    return <div className="stats-card form-error">{state.message}</div>;
  }
  if (state.status === "noranked") {
    return <div className="stats-card muted">Play a Competitive match to start your rank comparison.</div>;
  }
  if (state.status === "norank") {
    return (
      <div className="stats-card muted">
        Couldn't work out a rank to compare against yet. Try again after your next Competitive match.
      </div>
    );
  }
  if (state.status === "busy") {
    return (
      <div className="stats-card muted">
        The rank comparison is busy right now. Try ↻ Refresh in a minute.
      </div>
    );
  }

  const { target, rows, rankedCount, widened } = state;

  if (rows.length === 0) {
    return (
      <div className="stats-card muted">
        Your Competitive stats aren't available yet. New matches can take a while to show up.
      </div>
    );
  }

  const groupName = widened
    ? "players near your rank"
    : target.source === "rank"
    ? target.label
      ? `${target.label} players`
      : "players at your rank"
    : "players at your recent Competitive lobbies' level";

  // the weakest stats (below 40%) that have a tip become "where to improve"
  const focus = rows
    .filter((r) => r.better < 40 && r.tip)
    .sort((a, b) => a.better - b.better)
    .slice(0, 2);

  return (
    <div className="stats-card">
      <p className="stats-caption">
        Compared to {groupName} · Competitive · last {COMPARE_DAYS} days
      </p>

      {rankedCount < SOLID_SAMPLE && (
        <p className="field-hint" style={{ marginBottom: 12 }}>
          Early estimate from {rankedCount} Competitive match{rankedCount === 1 ? "" : "es"} in the last {PLAYER_DAYS} days.
          It gets more accurate as you play more.
        </p>
      )}

      <ul className="compare-list">
        {rows.map((r) => (
          <li key={r.key} className="compare-row">
            <span className="compare-label">{r.label}</span>
            <span className="compare-you">{formatValue(r.you, r)}</span>
            <span className="compare-bar" title={`Better than ${r.better}% of ${groupName}`}>
              <span
                className={r.better >= 60 ? "compare-fill good" : r.better < 40 ? "compare-fill weak" : "compare-fill"}
                style={{ width: `${Math.max(4, r.better)}%` }}
              />
            </span>
            <span className="compare-text">
              {r.better >= 50 ? `Top ${100 - r.better}%` : `Bottom ${r.better}%`}
              {r.median != null && <span className="muted"> · avg {formatValue(r.median, r)}</span>}
            </span>
          </li>
        ))}
      </ul>

      {focus.length > 0 && (
        <div className="focus-box">
          <p className="stats-caption">Where to improve</p>
          {focus.map((r) => (
            <p key={r.key}>
              <strong>{r.label}:</strong> {r.tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}