import { games } from "../Data/games";
import PlayerSearch from "../Components/PlayerSearch";

export default function HomeTab({ onOpenTab }) {
  return (
    <div className="home">
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