import { useEffect, useState } from "react";
import { clearPlayerCache, refreshAvailableAt, lastFetchedAt } from "./deadlock";
import DeadlockStats from "./DeadlockStats";
import RankComparison from "../games/RankComparison";

// 272 seconds -> "4:32"
const countdown = (ms) => {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

export default function DeadlockPanel({ steamId, recentCount = 5 }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [lastChecked, setLastChecked] = useState(() => lastFetchedAt(steamId));

  const availableAt = refreshAvailableAt(steamId);
  const remaining = Math.max(0, availableAt - now);
  const coolingDown = remaining > 0;

  // a different player: read their saved times
  useEffect(() => {
    setNow(Date.now());
    setLastChecked(lastFetchedAt(steamId));
  }, [steamId]);

  // tick once a second while the cooldown is running
  useEffect(() => {
    if (!coolingDown) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [coolingDown]);

  const refresh = () => {
    if (Date.now() < refreshAvailableAt(steamId)) return; // still cooling down
    clearPlayerCache(steamId); // also starts the 5-minute cooldown
    setNow(Date.now());
    setRefreshKey((k) => k + 1); // tells both components to load again
  };

  return (
    <div className="deadlock-panel">
      <div className="panel-toolbar">
        {lastChecked && (
          <span className="muted">
            Last checked {lastChecked.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
        <button
          type="button"
          className="btn-secondary"
          onClick={refresh}
          disabled={coolingDown}
          title={coolingDown ? "Stats can be refreshed once every 5 minutes" : "Load the latest stats"}
        >
          {coolingDown ? `Refresh in ${countdown(remaining)}` : "↻ Refresh"}
        </button>
      </div>

      <DeadlockStats
        steamId={steamId}
        recentCount={recentCount}
        refreshKey={refreshKey}
        onLoaded={() => setLastChecked(lastFetchedAt(steamId))}
      />
      <RankComparison steamId={steamId} refreshKey={refreshKey} />
    </div>
  );
}