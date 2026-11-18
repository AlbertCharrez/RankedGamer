
import { useEffect, useState } from "react";
import DeadlockPlayerSearch from "./DeadlockPlayerSearch";
import DeadlockLeaderboard, {
  DeadlockLeaderboardPreview
} from "./DeadlockLeaderboard";
import DeadlockStats from "./DeadlockStats";
import RankComparison from "../games/RankComparison";
import {
  fetchMatchHistory,
  fetchHeroes,
  summarize,
  isWin
} from "./deadlock";
import "./DeadlockTab.css";

export default function DeadlockTab({
  isLoggedIn,
  user,
  onLoginClick,
  onSignupClick
}) {
  const [selectedSection, setSelectedSection] = useState("overview");

  // Get the Steam ID connected to this user.
  const steamId = user?.steamId;

  // Store Deadlock match data for the dashboard.
  const [deadlockData, setDeadlockData] = useState({
    status: "loading",
    matches: [],
    heroes: {},
    message: ""
  });

  // Fetch the player's matches and hero information.
  useEffect(() => {
    let cancelled = false;

    if (!steamId) {
      setDeadlockData({
        status: "unlinked",
        matches: [],
        heroes: {},
        message: ""
      });
      return;
    }

    setDeadlockData({
      status: "loading",
      matches: [],
      heroes: {},
      message: ""
    });

    Promise.all([
      fetchMatchHistory(steamId),
      fetchHeroes()
    ])
      .then(([matches, heroes]) => {
        if (cancelled) return;

        setDeadlockData({
          status: matches.length > 0 ? "ready" : "empty",
          matches,
          heroes,
          message: ""
        });
      })
      .catch((error) => {
        if (cancelled) return;

        setDeadlockData({
          status: "error",
          matches: [],
          heroes: {},
          message: error.message || "Unable to load Deadlock statistics."
        });
      });

    return () => {
      cancelled = true;
    };
  }, [steamId]);

  // Calculate overall statistics when match data is available.
  const matches = deadlockData.matches;
  const heroes = deadlockData.heroes;

  const playerStats =
    deadlockData.status === "ready"
      ? summarize(matches)
      : null;

  // Group matches by hero and calculate each hero's statistics.
  const heroStats =
    deadlockData.status === "ready"
      ? Object.entries(
          matches.reduce((grouped, match) => {
            const heroId = match.hero_id;

            if (!grouped[heroId]) {
              grouped[heroId] = [];
            }

            grouped[heroId].push(match);
            return grouped;
          }, {})
        )
          .map(([heroId, heroMatches]) => {
            const wins = heroMatches.filter(isWin).length;
            const games = heroMatches.length;

            const summary = summarize(heroMatches);

            return {
              heroId,
              name: heroes[heroId]?.name || `Hero ${heroId}`,
              games,
              wins,
              losses: games - wins,
              winRate: games > 0 ? (wins / games) * 100 : 0,
              avgKda: summary.avgKda
            };
          })
          .sort((a, b) => b.games - a.games)
      : [];

  // Display the appropriate message when personal match data is unavailable.
  const renderDataNotice = () => {
    if (deadlockData.status === "loading") {
      return (
        <div className="deadlock-empty-card">
          <span>⏳</span>
          <h3>Loading Deadlock statistics...</h3>
        </div>
      );
    }

    if (deadlockData.status === "unlinked") {
      return (
        <div className="deadlock-empty-card">
          <span>🔗</span>
          <h3>Link a Steam account to view your statistics</h3>
          <p>Your Deadlock match history will appear here once available.</p>
        </div>
      );
    }

    if (deadlockData.status === "empty") {
      return (
        <div className="deadlock-empty-card">
          <span>🎮</span>
          <h3>No Deadlock match data found</h3>
          <p>
            No match data was found for this Steam account yet.
            If you've recently started playing, your matches may
            take a while to appear.
          </p>
        </div>
      );
    }

    if (deadlockData.status === "error") {
      return (
        <div className="deadlock-empty-card">
          <span>⚠️</span>
          <h3>Unable to load statistics</h3>
          <p>{deadlockData.message}</p>
        </div>
      );
    }

    return null;
  };

  // Logged-out landing screen.
  if (!isLoggedIn) {
    return (
      <div className="deadlock-landing">
        <section className="deadlock-landing-banner">
          <div>
            <p className="deadlock-label">RANKED GAMER</p>
            <h1>DEADLOCK</h1>
            <p>Track your performance. Climb the ranks.</p>
          </div>
        </section>

        <DeadlockPlayerSearch />

        <div className="deadlock-landing-features">
          <div className="deadlock-landing-feature">
            <span className="deadlock-landing-feature-icon">📊</span>
            <h3>Track Your Performance</h3>
            <p>
              View your win rates, K/D/A, match history,
              and performance trends.
            </p>
          </div>

          <div className="deadlock-landing-feature">
            <span className="deadlock-landing-feature-icon">👥</span>
            <h3>Discover Players</h3>
            <p>
              Search for other players and explore
              their profiles and statistics.
            </p>
          </div>

          <div className="deadlock-landing-feature">
            <span className="deadlock-landing-feature-icon">🏆</span>
            <h3>Climb the Leaderboards</h3>
            <p>
              Compare player rankings and see
              where you stand.
            </p>
          </div>
        </div>

        <div className="deadlock-landing-content">
          <p>
            Sign in to explore player profiles, hero statistics,
            match history, and leaderboards.
          </p>
        </div>

        <div className="deadlock-landing-buttons">
          <button
            className="deadlock-landing-login"
            onClick={onLoginClick}
          >
            Log In
          </button>

          <button
            className="deadlock-landing-signup"
            onClick={onSignupClick}
          >
            Sign Up
          </button>
        </div>

        {/* Public leaderboard is available without signing in. */}
        <DeadlockLeaderboard />
      </div>
    );
  }

  return (
    <div className="deadlock-page">

      {/* GAME BANNER */}
      <section className="deadlock-header">
        <div>
          <p className="deadlock-label">RANKED GAMER</p>
          <h1>DEADLOCK</h1>
          <p>Your Deadlock competitive dashboard</p>
        </div>

        <div className="deadlock-header-badge">
          DEADLOCK
        </div>
      </section>

      {/* PLAYER PROFILE */}
      <section className="deadlock-profile">
        <div className="deadlock-avatar">
          {user?.name?.charAt(0).toUpperCase() || "?"}
        </div>

        <div className="deadlock-profile-info">
          <span className="deadlock-profile-label">
            RANKED GAMER ACCOUNT
          </span>

          <h2>{user?.name || "Player"}</h2>

          <p>Welcome to your Deadlock dashboard.</p>
        </div>

        <div className="deadlock-account-status">
          <span className="deadlock-status-dot"></span>
          {steamId ? "Steam account linked" : "Steam account not linked"}
        </div>
      </section>

      {/* PLAYER SEARCH */}
      <section className="deadlock-search-section">
        <div>
          <h2>Find a Player</h2>
          <p>Search for other players and explore their profiles.</p>
        </div>

        <DeadlockPlayerSearch />
      </section>

      {/* NAVIGATION */}
      <nav className="deadlock-section-nav">
        <button
          className={selectedSection === "overview" ? "selected" : ""}
          onClick={() => setSelectedSection("overview")}
        >
          Overview
        </button>

        <button
          className={selectedSection === "performance" ? "selected" : ""}
          onClick={() => setSelectedSection("performance")}
        >
          Performance
        </button>

        <button
          className={selectedSection === "heroes" ? "selected" : ""}
          onClick={() => setSelectedSection("heroes")}
        >
          Hero Stats
        </button>

        <button
          className={selectedSection === "matches" ? "selected" : ""}
          onClick={() => setSelectedSection("matches")}
        >
          Match History
        </button>

        <button
          className={selectedSection === "leaderboard" ? "selected" : ""}
          onClick={() => setSelectedSection("leaderboard")}
        >
          Leaderboard
        </button>
      </nav>

      {/* OVERVIEW */}
      {selectedSection === "overview" && (
        <section className="deadlock-content">

          {deadlockData.status === "ready" ? (
            <>
              <div className="deadlock-section-heading">
                <div>
                  <span className="deadlock-label">YOUR STATISTICS</span>
                  <h2>Player Overview</h2>
                </div>

                <button
                  className="deadlock-text-button"
                  onClick={() => setSelectedSection("performance")}
                >
                  View All →
                </button>
              </div>

              <div className="deadlock-stat-grid">
                <div className="deadlock-stat-card">
                  <span className="deadlock-stat-icon">🏆</span>
                  <span>Wins</span>
                  <strong>{playerStats.wins}</strong>
                  <small>Total matches won</small>
                </div>

                <div className="deadlock-stat-card">
                  <span className="deadlock-stat-icon">📈</span>
                  <span>Win Rate</span>
                  <strong>{playerStats.winRate.toFixed(1)}%</strong>
                  <small>Percentage of matches won</small>
                </div>

                <div className="deadlock-stat-card">
                  <span className="deadlock-stat-icon">⚔️</span>
                  <span>Average KDA</span>
                  <strong>{playerStats.avgKda.toFixed(2)}</strong>
                  <small>Kills, deaths, and assists</small>
                </div>

                <div className="deadlock-stat-card">
                  <span className="deadlock-stat-icon">🎮</span>
                  <span>Matches Played</span>
                  <strong>{matches.length}</strong>
                  <small>Matches found for this account</small>
                </div>
              </div>

              {/* FAVORITE HEROES PREVIEW */}
              <div className="deadlock-subsection">
                <div className="deadlock-section-heading">
                  <div>
                    <span className="deadlock-label">YOUR FAVORITES</span>
                    <h2>Favorite Heroes</h2>
                  </div>

                  <button
                    className="deadlock-text-button"
                    onClick={() => setSelectedSection("heroes")}
                  >
                    View All →
                  </button>
                </div>

                <div className="deadlock-hero-grid">
                  {heroStats.slice(0, 3).map((hero) => (
                    <div className="deadlock-hero-card" key={hero.heroId}>
                      <div className="deadlock-hero-placeholder">
                        <span>⚔️</span>
                      </div>

                      <h3>{hero.name}</h3>
                      <p>{hero.games} matches played</p>
                      <p>{hero.winRate.toFixed(1)}% win rate</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT MATCHES PREVIEW */}
              <div className="deadlock-subsection">
                <div className="deadlock-section-heading">
                  <div>
                    <span className="deadlock-label">YOUR GAMEPLAY</span>
                    <h2>Recent Matches</h2>
                  </div>

                  <button
                    className="deadlock-text-button"
                    onClick={() => setSelectedSection("matches")}
                  >
                    View All →
                  </button>
                </div>

                <div className="deadlock-recent-matches">
                  {matches.slice(0, 5).map((match) => (
                    <div className="deadlock-recent-match" key={match.match_id}>
                      <strong>
                        {heroes[match.hero_id]?.name || `Hero ${match.hero_id}`}
                      </strong>

                      <span className={isWin(match) ? "match-win" : "match-loss"}>
                        {isWin(match) ? "Victory" : "Defeat"}
                      </span>

                      <span>
                        {match.match_duration
                          ? `${Math.floor(match.match_duration / 60)} min`
                          : "Duration unavailable"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            renderDataNotice()
          )}

          {/* LEADERBOARD PREVIEW */}
          <div className="deadlock-subsection">
            <div className="deadlock-section-heading">
              <div>
                <span className="deadlock-label">TOP PLAYERS</span>
                <h2>Leaderboard Preview</h2>
              </div>

              <button
                className="deadlock-text-button"
                onClick={() => setSelectedSection("leaderboard")}
              >
                View All →
              </button>
            </div>

            <DeadlockLeaderboardPreview />
          </div>

        </section>
      )}

      {/* HERO STATS */}
      {selectedSection === "heroes" && (
        <section className="deadlock-content">

          <div className="deadlock-section-heading">
            <div>
              <span className="deadlock-label">CHARACTER PERFORMANCE</span>
              <h2>Hero Statistics</h2>
              <p>Statistics for each hero you've played.</p>
            </div>
          </div>

          {deadlockData.status === "ready" ? (
            <div className="deadlock-hero-grid">
              {heroStats.map((hero) => (
                <div className="deadlock-hero-card" key={hero.heroId}>
                  <div className="deadlock-hero-placeholder">
                    <span>⚔️</span>
                  </div>

                  <h3>{hero.name}</h3>
                  <p>Games played: {hero.games}</p>
                  <p>Wins: {hero.wins}</p>
                  <p>Losses: {hero.losses}</p>
                  <p>Win rate: {hero.winRate.toFixed(1)}%</p>
                  <p>Average KDA: {hero.avgKda.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            renderDataNotice()
          )}

        </section>
      )}

      {/* PERFORMANCE */}
      {selectedSection === "performance" && (
        <section className="deadlock-content">

          <div className="deadlock-section-heading">
            <div>
              <span className="deadlock-label">ANALYZE YOUR GAMEPLAY</span>
              <h2>Performance Overview</h2>
              <p className="deadlock-performance-description">
                Track your statistics and monitor your improvement over time.
              </p>
            </div>
          </div>

          {deadlockData.status === "ready" ? (
            <>
              <div className="deadlock-stat-grid">
                <div className="deadlock-stat-card">
                  <span className="deadlock-stat-icon">📈</span>
                  <span>Win Rate</span>
                  <strong>{playerStats.winRate.toFixed(1)}%</strong>
                  <small>Percentage of matches won</small>
                </div>

                <div className="deadlock-stat-card">
                  <span className="deadlock-stat-icon">⚔️</span>
                  <span>Average KDA</span>
                  <strong>{playerStats.avgKda.toFixed(2)}</strong>
                  <small>Kills, deaths, and assists</small>
                </div>

                <div className="deadlock-stat-card">
                  <span className="deadlock-stat-icon">🏆</span>
                  <span>Wins</span>
                  <strong>{playerStats.wins}</strong>
                  <small>Total matches won</small>
                </div>

                <div className="deadlock-stat-card">
                  <span className="deadlock-stat-icon">🎮</span>
                  <span>Losses</span>
                  <strong>{playerStats.losses}</strong>
                  <small>Total matches lost</small>
                </div>
              </div>

              <div className="deadlock-subsection">
                <div className="deadlock-section-heading">
                  <div>
                    <h2>Rank Comparison</h2>
                    <p className="deadlock-performance-description">
                      Compare your performance with players in your rank.
                    </p>
                  </div>
                </div>

                <RankComparison steamId={steamId} />
              </div>
            </>
          ) : (
            renderDataNotice()
          )}

        </section>
      )}

      {/* MATCH HISTORY */}
      {selectedSection === "matches" && (
        <section className="deadlock-content">

          <div className="deadlock-section-heading">
            <div>
              <span className="deadlock-label">YOUR GAMEPLAY</span>
              <h2>Match History</h2>
            </div>
          </div>

          {deadlockData.status === "ready" ? (
            <DeadlockStats
              steamId={steamId}
              recentCount={20}
            />
          ) : (
            renderDataNotice()
          )}

        </section>
      )}

      {/* PUBLIC LEADERBOARD */}
      {selectedSection === "leaderboard" && (
        <section className="deadlock-content">
          <DeadlockLeaderboard />
        </section>
      )}

    </div>
  );
}
