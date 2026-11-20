export default function GameCard({ game, onClick }) {
  return (
    <button
      type="button"
      className="game-card"
      style={{ "--accent": game.color }}
      onClick={onClick}
    >
      <img src={game.image} alt={game.name} />
      <span>{game.name}</span>
    </button>
  );
}