import { useState } from "react";
import { parseSteamId, steamProfileUrl } from "../Data/accounts";
import {
  fetchMatchHistory,
  fetchRank,
  fetchHeroes,
  summarize,
  isWin,
} from "../Data/deadlock";
import "./DeadlockPlayerSearch.css";

/**
 * Public Deadlock lookup. This currently accepts a SteamID64 or a Steam
 * community profile URL; the API/data files supplied do not support
 * searching for a player by their display name or vanity URL.
 */
export default function DeadlockPlayerSearch() {
  const [query, setQuery] = useState("");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const steamId = parseSteamId(query);
    if (!steamId) {
      setPlayer(null);
      setError(
        query.trim()
          ? "Enter a valid 17-digit SteamID64 or a Steam profile URL. Searching by display name is not available yet."
          : "Enter a SteamID64 or Steam profile URL to search."
      );
      return;
    }

    setLoading(true);
    setError("");
    setPlayer(null);

    try {
      const [matches, rank, heroes] = await Promise.all([
        fetchMatchHistory(steamId),
        fetchRank(steamId),
        fetchHeroes(),
      ]);

      setPlayer({
        steamId,
        matches,
        rank,
        heroes,
        summary: summarize(matches),
      });
    } catch (err) {
      setError(err?.message || "Couldn't search for that Deadlock player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const recentMatches = player?.matches?.slice(0, 5) ?? [];

  return (
    <section className="deadlock-player-search" aria-label="Search Deadlock players">
      <div className="deadlock-player-search-heading">
        <div>
          <span className="deadlock-player-search-eyebrow">PLAYER LOOKUP</span>
          <h2>Find a Deadlock Player</h2>
          <p>Look up a player using their SteamID64 or Steam profile link.</p>
        </div>
      </div>

      <form className="deadlock-player-search-form" onSubmit={handleSubmit}>
        <span className="deadlock-player-search-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter SteamID64 or Steam profile URL"
          aria-label="SteamID64 or Steam profile URL"
          disabled={loading}
        />
        {query && !loading && (
          <button
            className="deadlock-player-search-clear"
            type="button"
            onClick={() => {
              setQuery("");
              setError("");
              setPlayer(null);
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        <button className="deadlock-player-search-submit" type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <p className="deadlock-player-search-hint">
        Example: 7656119XXXXXXXXXX or steamcommunity.com/profiles/…
      </p>

      {error && <p className="deadlock-player-search-error" role="alert">{error}</p>}

      {player && (
        <div className="deadlock-player-search-result" aria-live="polite">
          <div className="deadlock-player-result-top">
            <div>
              <span className="deadlock-player-search-eyebrow">PLAYER RESULTS</span>
              <h3>{player.rank?.label || (player.rank ? `Rank badge ${player.rank.badge}` : "Deadlock Player")}</h3>
              <a href={steamProfileUrl(player.steamId)} target="_blank" rel="noreferrer">
                View Steam profile ↗
              </a>
            </div>
            <span className="deadlock-player-result-rank">
              {player.rank ? player.rank.label || `Badge ${player.rank.badge}` : "Rank unavailable"}
            </span>
          </div>

          <div className="deadlock-player-result-stats">
            <div><span>Matches found</span><strong>{player.summary.played}</strong></div>
            <div><span>Win rate</span><strong>{player.summary.winRate}%</strong></div>
            <div><span>Wins</span><strong>{player.summary.wins}</strong></div>
            <div><span>Losses</span><strong>{player.summary.losses}</strong></div>
          </div>

          {recentMatches.length > 0 ? (
            <div className="deadlock-player-result-matches">
              <h4>Recent matches</h4>
              {recentMatches.map((match) => {
                const hero = player.heroes?.[match.hero_id];
                return (
                  <div className="deadlock-player-result-match" key={match.match_id}>
                    <span className={`deadlock-player-match-outcome ${isWin(match) ? "is-win" : "is-loss"}`}>
                      {isWin(match) ? "WIN" : "LOSS"}
                    </span>
                    <span className="deadlock-player-match-hero">{hero?.name || `Hero ${match.hero_id}`}</span>
                    <span className="deadlock-player-match-kda">
                      {(match.player_kills ?? 0)} / {(match.player_deaths ?? 0)} / {(match.player_assists ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="deadlock-player-search-empty">No match history was returned for this Steam account.</p>
          )}
        </div>
      )}
    </section>
  );
}
