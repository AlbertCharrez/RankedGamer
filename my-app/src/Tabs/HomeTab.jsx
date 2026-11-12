import { games } from "../Data/games";
import GameCard from "../Components/GameCard";
import PlayerProfileSearch from "../Components/PlayerProfileSearch";

export default function HomeTab({ onOpenTab, onOpenProfile }) {
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
          <PlayerProfileSearch onOpenProfile={onOpenProfile} />
        </div>
      </section>

      <section className="game-grid">
        {games.map((g) => (
          <GameCard key={g.id} game={g} onClick={() => onOpenTab(g.id)} />
        ))}
      </section>
    </div>
  );
}