import { useState } from "react";
import SearchBubble from "./SearchBubble.jsx";
import { searchAllPlayers } from "../Data/accounts";
import { games } from "../Data/games";

const gameInfo = (id) => games.find((g) => g.id === id) ?? { id, name: id, color: "#888" };

export default function PlayerProfileSearch({ onOpenTab }) {
  const [results, setResults] = useState(null); // null = not searched yet

  const handleSearch = async (q) => setResults(await searchAllPlayers(q));

  return (
    <div className="profile-search">
      <SearchBubble onSearch={handleSearch} placeholder="Search for an RG account" />

      {results !== null && (
        <div className="profile-results">
          {results.length === 0 ? (
            <p className="no-results">No players found.</p>
          ) : (
            results.map((p) => {
              const gameIds = Object.keys(p.games);
              return (
                <div key={p.name} className="player-card">
                  <div className="player-card-header">
                    <span className="avatar small">{p.name[0].toUpperCase()}</span>
                    <strong>{p.name}</strong>
                    {p.registered && <span className="badge">Member</span>}
                    <span className="game-count">
                      {gameIds.length} game{gameIds.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="player-games">
                    {gameIds.length === 0 ? (
                      <span className="muted">No games listed</span>
                    ) : (
                      gameIds.map((id) => {
                        const g = gameInfo(id);
                        const stats = p.games[id];
                        return (
                          <button
                            key={id}
                            type="button"
                            className="game-chip"
                            style={{ "--accent": g.color }}
                            onClick={() => onOpenTab?.(id)}
                          >
                            <span className="game-chip-name">{g.name}</span>
                            {stats.rank && <span>{stats.rank}</span>}
                            {stats.kd != null && <span>K/D {stats.kd}</span>}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}