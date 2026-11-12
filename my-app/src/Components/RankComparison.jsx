import { useEffect, useState } from "react";
import {
  fetchRank,
  fetchMatchHistory,
  fetchComparison,
  percentileOf,
  COMPARE_METRICS,
  COMPARE_DAYS,
} from "../Data/deadlock";

const RANKED_MODE = 4; // match_mode for ranked matches
const MIN_MATCHES = 10;

const formatValue = (v, metric) => {
  if (metric.percent) return `${(v <= 1 ? v * 100 : v).toFixed(1)}%`;
  return v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1);
};

export default function RankComparison({ steamId }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    (async () => {
      try {
        const [rank, history] = await Promise.all([fetchRank(steamId), fetchMatchHistory(steamId)]);
        const { group, player } = await fetchComparison(steamId, rank?.badge);

        const since = Date.now() / 1000 - COMPARE_DAYS * 86400;
        const rankedCount = history.filter(
          (m) => m.match_mode === RANKED_MODE && (m.start_time ?? 0) >= since
        ).length;

        const rows = COMPARE_METRICS.map((metric) => {
          const you = player?.[metric.key]?.avg;
          const dist = group?.[metric.key];
          let pct = percentileOf(you, dist);
          if (pct == null) return null;
          if (metric.lowerIsBetter) pct = 100 - pct; // "better than X%" either way
          return { ...metric, you, median: dist?.percentile50, better: Math.round(pct) };
        }).filter(Boolean);

        if (!cancelled) setState({ status: "ready", rank, rows, rankedCount });
      } catch (err) {
        if (!cancelled) setState({ status: "error", message: err.message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [steamId]);

  if (state.status === "loading") return <div className="stats-card muted">Comparing to players at this rank...</div>;
  if (state.status === "error") return <div className="stats-card form-error">{state.message}</div>;

  const { rank, rows, rankedCount } = state;
  if (rows.length === 0) {
    return <div className="stats-card muted">Not enough ranked data to compare yet.</div>;
  }

  const groupName = rank?.label ? `${rank.label} players` : rank ? "players at this rank" : "all players";
  const focus = rows.filter((r) => r.better < 40 && r.tip).sort((a, b) => a.better - b.better).slice(0, 2);

  return (
    <div className="stats-card">
      <p className="stats-caption">
        Compared to {groupName} · ranked · last {COMPARE_DAYS} days
      </p>

      {rankedCount < MIN_MATCHES && (
        <p className="field-hint" style={{ marginBottom: 12 }}>
          Based on only {rankedCount} recent ranked match{rankedCount === 1 ? "" : "es"}. These numbers will be
          more accurate after {MIN_MATCHES}+.
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