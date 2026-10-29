import { Link } from "react-router-dom";
import { games } from "../Data/games";
import PlayerSearch from "../Components/PlayerSearch";

export default function HomeTab() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Track your stats</h1>
        <p>Search a player or pick a game to get started</p>
        <PlayerSearch />
      </section>

      <section className="game-grid">
        {games.map((g) => (
          <Link
            key={g.id}
            to={`/game/${g.id}`}
            className="game-card"
            style={{ "--accent": g.color }}
          >
            <img src={g.image} alt={g.name} />
            <span>{g.name}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}