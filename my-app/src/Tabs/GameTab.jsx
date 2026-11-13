import LinkedAccountBanner from "../Components/LinkedAccountBanner";
import DeadlockStats from "../Components/DeadlockStats";
import RankComparison from "../Components/RankComparison";

export default function GameTab({ game, person, isOwn, onClearViewed, onLinkAccounts }) {
  {showDeadlock ? (
  <>
    <DeadlockStats steamId={person.steamId} recentCount={10} />
    <RankComparison steamId={person.steamId} />
  </>
) : game.id !== "deadlock" ? (
  <p className="muted">Stats for {game.name} are coming soon.</p>
) : null}

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
        <DeadlockStats steamId={person.steamId} recentCount={10} />
      ) : game.id !== "deadlock" ? (
        <p className="muted">Stats for {game.name} are coming soon.</p>
      ) : null}
    </div>
  );
}