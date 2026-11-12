import { useState } from "react";
import SearchBubble from "./SearchBubble.jsx";
import Avatar from "./Avatar";
import { searchAllPlayers } from "../Data/accounts";
import { getGame } from "../Data/games";

export default function PlayerProfileSearch({ onOpenProfile }) {
  const [results, setResults] = useState(null); // null = not searched yet
  const [error, setError] = useState("");

  const handleSearch = async (q) => {
    try {
      setError("");
      setResults(await searchAllPlayers(q));
    } catch {
      setError("Search failed. Please try again.");
      setResults(null);
    }
  };

  return (
    <div className="profile-search">
      <SearchBubble onSearch={handleSearch} placeholder="Search for an RG account" />

      {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}

      {results !== null && (
        <div className="profile-results">
          {results.length === 0 ? (
            <p className="muted">No players found.</p>
          ) : (
            results.map((p) => (
              <div key={p.id} className="player-card">
                <button type="button" className="player-card-header" onClick={() => onOpenProfile(p)}>
                  <Avatar user={p} size="small" />
                  <strong>{p.name}</strong>
                  <span className="game-count">
                    {p.games.length} game{p.games.length === 1 ? "" : "s"}
                  </span>
                </button>

                <div className="player-games">
                  {p.games.length === 0 ? (
                    <span className="muted">No games listed</span>
                  ) : (
                    p.games.map((id) => {
                      const g = getGame(id);
                      if (!g) return null; // skip games that no longer exist
                      return (
                        <button
                          key={id}
                          type="button"
                          className="game-chip"
                          style={{ "--accent": g.color }}
                          onClick={() => onOpenProfile(p, id)}
                        >
                          <span className="game-chip-name">{g.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}