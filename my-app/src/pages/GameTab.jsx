import LinkedAccountBanner from "../Components/LinkedAccountBanner";
import DeadlockPanel from "../../Components/deadlock";

export default function GameTab({ game, person, isOwn, onClearViewed, onLinkAccounts }) {
  const showDeadlock = game.id === "deadlock" && person?.steamId;

  return (
    <div className="game-tab" style={{ "--accent": game.color }}>
      <LinkedAccountBanner
        game={game}
        person={person}
        isOwn={isOwn}
        onClear={onClearViewed}
        onLinkAccounts={onLinkAccounts}
      />
      <h1>{game.name}</h1>

      {showDeadlock ? (
        <DeadlockPanel steamId={person.steamId} recentCount={10} />
      ) : game.id !== "deadlock" ? (
        <p className="muted">Stats for {game.name} are coming soon.</p>
      ) : null}
    </div>
  );
}