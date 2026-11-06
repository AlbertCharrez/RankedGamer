import { useState } from "react";
import PlayerSearch from "../Components/PlayerSearch";
import "./Deadlock.css";

export default function DeadlockTab({
  isLoggedIn,
  user,
  onLoginClick,
  onSignupClick
}) {
  const [selectedSection, setSelectedSection] = useState("overview");

  // Logged-out landing screen
  if (!isLoggedIn) {
    return (
      <div className="deadlock-landing">
        <div className="deadlock-landing-content">
          <p className="deadlock-label">RANKED GAMER</p>
          <h1>DEADLOCK</h1>
          <p>Track your performance. Climb the ranks.</p>
          <p>
            Sign in to explore player profiles, hero statistics,
            match history, and leaderboards.
          </p>

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

          {/* Landing Page Features */}
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

          {/* Development Disclaimer */}
          <p className="deadlock-landing-disclaimer">
            Ranked Gamer is a community stats and player-tracking
            platform. Some features and statistics are currently
            under development.
          </p>
        </div>
      </div>
    );
  }

  // Placeholder hero cards until real game data is connected
  const heroes = [
    "Most Played Hero",
    "Second Favorite",
    "Third Favorite"
  ];

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
          Deadlock account not linked
        </div>
      </section>

      {/* PLAYER SEARCH */}
      <section className="deadlock-search-section">
        <div>
          <h2>Find a Player</h2>
          <p>Search for other players and explore their profiles.</p>
        </div>

        <PlayerSearch game="deadlock" />
      </section>

      {/* NAVIGATION */}
      <nav className="deadlock-section-nav">
        <button
          className={selectedSection === "overview" ? "selected" : ""}
          onClick={() => setSelectedSection("overview")}
        >Overview</button>

        <button
          className={selectedSection === "performance" ? "selected" : ""}
          onClick={() => setSelectedSection("performance")}
        >Performance</button>

        <button
          className={selectedSection === "heroes" ? "selected" : ""}
          onClick={() => setSelectedSection("heroes")}
        >Hero Stats</button>

        <button
          className={selectedSection === "matches" ? "selected" : ""}
          onClick={() => setSelectedSection("matches")}
        >Match History</button>

        <button
          className={selectedSection === "leaderboard" ? "selected" : ""}
          onClick={() => setSelectedSection("leaderboard")}
        >Leaderboard</button>
      </nav>

      {/* OVERVIEW */}
      {selectedSection === "overview" && (
        <section className="deadlock-content">

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
              <span>Current Rank</span>
              <strong>--</strong>
              <small>Your competitive rank</small>
            </div>

            <div className="deadlock-stat-card">
              <span className="deadlock-stat-icon">📈</span>
              <span>Win Rate</span>
              <strong>--</strong>
              <small>Percentage of matches won</small>
            </div>

            <div className="deadlock-stat-card">
              <span className="deadlock-stat-icon">⚔️</span>
              <span>K/D/A</span>
              <strong>--</strong>
              <small>Kills / Deaths / Assists</small>
            </div>

            <div className="deadlock-stat-card">
              <span className="deadlock-stat-icon">🎮</span>
              <span>Matches Played</span>
              <strong>--</strong>
              <small>Total games played</small>
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
              {heroes.map((hero, index) => (
                <div className="deadlock-hero-card" key={hero}>
                  <div className="deadlock-hero-placeholder">
                    <span>⚔️</span>
                  </div>
                  <h3>{hero}</h3>
                  <p>Hero statistics coming soon</p>
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

            <div className="deadlock-empty-card">
              <span>🎮</span>
              <h3>No match history yet</h3>
            </div>
          </div>

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

            <div className="deadlock-leaderboard-preview">

              {/* FIRST PLACE */}
              <div className="deadlock-leaderboard-player">
                <div className="deadlock-leaderboard-rank first">
                  #1
                </div>

                <div className="deadlock-leaderboard-player-info">
                  <strong>Top Player</strong>
                  <span>Player profile</span>
                </div>

                <div className="deadlock-leaderboard-player-stat">
                  <span>Rank</span>
                  <strong>--</strong>
                </div>
              </div>

              {/* SECOND PLACE */}
              <div className="deadlock-leaderboard-player">
                <div className="deadlock-leaderboard-rank">
                  #2
                </div>

                <div className="deadlock-leaderboard-player-info">
                  <strong>Second Player</strong>
                  <span>Player profile</span>
                </div>

                <div className="deadlock-leaderboard-player-stat">
                  <span>Rank</span>
                  <strong>--</strong>
                </div>
              </div>

              {/* THIRD PLACE */}
              <div className="deadlock-leaderboard-player">
                <div className="deadlock-leaderboard-rank">
                  #3
                </div>

                <div className="deadlock-leaderboard-player-info">
                  <strong>Third Player</strong>
                  <span>Player profile</span>
                </div>

                <div className="deadlock-leaderboard-player-stat">
                  <span>Rank</span>
                  <strong>--</strong>
                </div>
              </div>

            </div>
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
            </div>
          </div>

          <div className="deadlock-hero-grid">
            {heroes.map((hero) => (
              <div className="deadlock-hero-card" key={hero}>
                <div className="deadlock-hero-placeholder">
                  <span>⚔️</span>
                </div>
                <h3>{hero}</h3>
                <p>Games played: --</p>
                <p>Win rate: --</p>
                <p>K/D/A: --</p>
              </div>
            ))}
          </div>

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

            <span className="deadlock-coming-soon">
              STATS PENDING
            </span>
          </div>

          {/* PERFORMANCE STATISTICS */}
          <div className="deadlock-stat-grid">

            <div className="deadlock-stat-card">
              <span className="deadlock-stat-icon">📈</span>
              <span>Win Rate</span>
              <strong>--</strong>
              <small>Percentage of matches won</small>
            </div>

            <div className="deadlock-stat-card">
              <span className="deadlock-stat-icon">⚔️</span>
              <span>K/D/A</span>
              <strong>--</strong>
              <small>Kills / Deaths / Assists</small>
            </div>

            <div className="deadlock-stat-card">
              <span className="deadlock-stat-icon">🎯</span>
              <span>K/D Ratio</span>
              <strong>--</strong>
              <small>Kills compared to deaths</small>
            </div>

            <div className="deadlock-stat-card">
              <span className="deadlock-stat-icon">🏆</span>
              <span>Wins</span>
              <strong>--</strong>
              <small>Total matches won</small>
            </div>

          </div>

          {/* PERFORMANCE CHART */}
          <div className="deadlock-performance-panel">
            <div className="deadlock-performance-heading">
              <div>
                <h3>Performance Trends</h3>
                <p>Track your win rate and K/D/A over time.</p>
              </div>
              <span className="deadlock-chart-period">ALL TIME</span>
            </div>

            <div className="deadlock-chart-placeholder">
              <div className="deadlock-chart-grid">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              <div className="deadlock-chart-empty">
                <span>📊</span>
                <h3>Performance data unavailable</h3>
                <p>
                  Your performance chart will appear here once your
                  Deadlock statistics are connected.
                </p>
                <strong>--</strong>
              </div>
            </div>
          </div>

          {/* ADDITIONAL STATISTICS */}
          <div className="deadlock-subsection">
            <div className="deadlock-section-heading">
              <div>
                <h2>Additional Statistics</h2>
                <p className="deadlock-performance-description">
                  More details about your overall gameplay.
                </p>
              </div>
            </div>

            <div className="deadlock-stat-grid">

              <div className="deadlock-stat-card">
                <span>Average Kills</span>
                <strong>--</strong>
                <small>Per match</small>
              </div>

              <div className="deadlock-stat-card">
                <span>Average Deaths</span>
                <strong>--</strong>
                <small>Per match</small>
              </div>

              <div className="deadlock-stat-card">
                <span>Average Assists</span>
                <strong>--</strong>
                <small>Per match</small>
              </div>

              <div className="deadlock-stat-card">
                <span>Win / Loss</span>
                <strong>--</strong>
                <small>Match record</small>
              </div>

            </div>
          </div>

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

          <div className="deadlock-empty-card">
            <span>🕹️</span>
            <h3>Your matches will appear here</h3>
            <p>
              View your wins, losses, heroes played, K/D/A,
              and match duration.
            </p>
          </div>

        </section>
      )}

      {/* LEADERBOARD */}
      {selectedSection === "leaderboard" && (
        <section className="deadlock-content">

          <div className="deadlock-section-heading">
            <div>
              <span className="deadlock-label">COMPETE WITH OTHERS</span>
              <h2>Deadlock Leaderboard</h2>
            </div>
          </div>

          <div className="deadlock-empty-card">
            <span>🏆</span>
            <h3>Player rankings coming soon</h3>
            <p>
              See how you compare with other Deadlock players
              on Ranked Gamer.
            </p>
          </div>

        </section>
      )}

    </div>
  );
}