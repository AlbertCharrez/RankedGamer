import { games } from "../Data/games";
import PlayerProfileSearch from "../Components/PlayerProfileSearch";

export default function HomeTab({ onOpenTab }) {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-left">
          <p className="site-tagline">
            Track your stats across <strong>Deadlock</strong>,{" "}
            <strong>Marvel Rivals</strong> and <strong>CS2</strong>
          </p>
        </div>

        <div className="hero-right">
          <h1 className="site-title">
            Ranked<span>Gamer</span>
          </h1>
          <PlayerProfileSearch onOpenTab={onOpenTab} />
        </div>
      </section>

      <section className="game-grid">
        {games.map((g) => (
          <button
            key={g.id}
            type="button"
            className="game-card"
            style={{ "--accent": g.color }}
            onClick={() => onOpenTab(g.id)}
          >
            <img src={g.image} alt={g.name} />
            <span>{g.name}</span>
          </button>
        ))}
      </section>
    </div>
  );
}