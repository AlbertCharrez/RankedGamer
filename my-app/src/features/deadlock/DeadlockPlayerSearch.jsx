
import { useState } from "react";
import { parseSteamId, steamProfileUrl } from "../profile/accounts";
import {
  fetchMatchHistory,
  fetchRank,
  fetchHeroes,
  summarize,
  isWin,
} from "./deadlock";
import "./DeadlockPlayerSearch.css";

const API = "https://api.deadlock-api.com";
const STEAM64_BASE = 76561197960265728n;

function toSteamId64(accountId) {
  return (BigInt(accountId) + STEAM64_BASE).toString();
}

export default function DeadlockPlayerSearch() {
  const [query, setQuery] = useState("");
  const [player, setPlayer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPlayer(steamId) {
    setLoading(true);
    setError("");
    setPlayer(null);
    setSearchResults([]);

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
      setError(
        err?.message ||
          "Couldn't load that Deadlock player. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const value = query.trim();

    if (!value) {
      setError("Enter a Steam name, SteamID64, or Steam profile URL.");
      setPlayer(null);
      setSearchResults([]);
      return;
    }

    // If the input is already a SteamID64 or profile URL, look it up directly.
    const steamId = parseSteamId(value);

    if (steamId) {
      await loadPlayer(steamId);
      return;
    }

    // Otherwise, search Steam display names using the Deadlock API.
    setLoading(true);
    setError("");
    setPlayer(null);
    setSearchResults([]);

    try {
      const url = new URL(`${API}/v1/players/steam-search`);
      url.searchParams.set("search_query", value);
      url.searchParams.set("limit", "8");
      url.searchParams.set("min_matches_played_last_30d", "0");

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Couldn't search Steam players. Please try again.");
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : [];

      if (results.length === 0) {
        setError("No Steam players found. Check the name and try again.");
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong with player search.");
    } finally {
      setLoading(false);
    }
  };

  const recentMatches = player?.matches?.slice(0, 5) ?? [];

  return (
    <section
      className="deadlock-player-search"
      aria-label="Search Deadlock players"
    >
      <div className="deadlock-player-search-heading">
        <div>
          <span className="deadlock-player-search-eyebrow">PLAYER LOOKUP</span>
          <h2>Find a Deadlock Player</h2>
          <p>Search using a Steam display name, SteamID64, or profile link.</p>
        </div>
      </div>

      <form className="deadlock-player-search-form" onSubmit={handleSubmit}>
        <span className="deadlock-player-search-icon" aria-hidden="true">
          ⌕
        </span>

        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter Steam name, SteamID64, or profile URL"
          aria-label="Steam name, SteamID64, or Steam profile URL"
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
              setSearchResults([]);
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}

        <button
          className="deadlock-player-search-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <p className="deadlock-player-search-hint">
        You can search by a player's public Steam display name or paste their
        Steam profile link.
      </p>

      {error && (
        <p className="deadlock-player-search-error" role="alert">
          {error}
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="deadlock-player-search-results" aria-live="polite">
          <h3>Choose the correct Steam account</h3>
          <p>
            Multiple players can have the same display name. Select the account
            you want to look up.
          </p>

          {searchResults.map((account) => {
            const steamId64 = toSteamId64(account.account_id);

            return (
              <button
                className="deadlock-player-search-option"
                type="button"
                key={account.account_id}
                disabled={loading}
                onClick={() => loadPlayer(steamId64)}
              >
                <img
                  src={account.avatar || account.avatarmedium}
                  alt=""
                  className="deadlock-player-search-avatar"
                />

                <span className="deadlock-player-search-account">
                  <strong>{account.personaname || "Unknown player"}</strong>
                  <small>
                    {account.matches_played_last_30d ?? 0} matches in the last
                    30 days
                  </small>
                </span>

                <span className="deadlock-player-search-select">
                  Select
                </span>
              </button>
            );
          })}
        </div>
      )}

      {player && (
        <div className="deadlock-player-search-result" aria-live="polite">
          <div className="deadlock-player-result-top">
            <div>
              <span className="deadlock-player-search-eyebrow">
                PLAYER RESULTS
              </span>
              <h3>
                {player.rank?.label ||
                  (player.rank
                    ? `Rank badge ${player.rank.badge}`
                    : "Deadlock Player")}
              </h3>
              <a
                href={steamProfileUrl(player.steamId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Steam profile ↗
              </a>
            </div>

            <span className="deadlock-player-result-rank">
              {player.rank
                ? player.rank.label || `Badge ${player.rank.badge}`
                : "Rank unavailable"}
            </span>
          </div>

          <div className="deadlock-player-result-stats">
            <div>
              <span>Matches found</span>
              <strong>{player.summary.played}</strong>
            </div>
            <div>
              <span>Win rate</span>
              <strong>{player.summary.winRate}%</strong>
            </div>
            <div>
              <span>Wins</span>
              <strong>{player.summary.wins}</strong>
            </div>
            <div>
              <span>Losses</span>
              <strong>{player.summary.losses}</strong>
            </div>
          </div>

          {recentMatches.length > 0 ? (
            <div className="deadlock-player-result-matches">
              <h4>Recent matches</h4>

              {recentMatches.map((match) => {
                const hero = player.heroes?.[match.hero_id];

                return (
                  <div
                    className="deadlock-player-result-match"
                    key={match.match_id}
                  >
                    <span
                      className={`deadlock-player-match-outcome ${
                        isWin(match) ? "is-win" : "is-loss"
                      }`}
                    >
                      {isWin(match) ? "WIN" : "LOSS"}
                    </span>

                    <span className="deadlock-player-match-hero">
                      {hero?.name || `Hero ${match.hero_id}`}
                    </span>

                    <span className="deadlock-player-match-kda">
                      {match.player_kills ?? 0} / {match.player_deaths ?? 0} /{" "}
                      {match.player_assists ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="deadlock-player-search-empty">
              No match history was returned for this Steam account.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
