import LinkedAccountBanner from "../Components/LinkedAccountBanner";

export default function GameTab({ game, person, isOwn, onClearViewed }) {
  return (
    <div className="game-tab" style={{ "--accent": game.color }}>
      <LinkedAccountBanner game={game} person={person} isOwn={isOwn} onClear={onClearViewed} />
      <h1>{game.name}</h1>
      <p className="muted">Stats for {game.name} are coming soon.</p>
    </div>
  );
}