import { useState } from "react";
import SearchBubble from "./SearchBubble.jsx";
import { fakeSearch } from "../Data/players";

export default function PlayerSearch({ game }) {
  const [results, setResults] = useState(null); // null = not searched yet

  const handleSearch = async (q) => {
    let data = await fakeSearch(q);
    if (game) data = data.filter((p) => p.game === game); // optional per-tab filter
    setResults(data);
  };

  return (
    <div className="player-search">
      <SearchBubble onSearch={handleSearch} />

      {results !== null && (
        <ul className="player-results">
          {results.length === 0 ? (
            <li>No players found.</li>
          ) : (
            results.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> · {p.game.toUpperCase()} · {p.rank} · K/D {p.kd}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}