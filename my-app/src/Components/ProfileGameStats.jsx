import { useState } from "react";
import { games } from "../Data/games";
import DeadlockStats from "./DeadlockStats";
import RankComparison from "./RankComparison";

export default function ProfileGameStats({ user, isOwn, onLinkAccounts }) {
  const myGames = games.filter((g) => user.games.includes(g.id));
  const [selectedId, setSelectedId] = useState(myGames[0]?.id ?? null);

  if (myGames.length === 0) return null;

  // if the selected game was removed from the profile, fall back to the first one
  const game = myGames.find((g) => g.id === selectedId) ?? myGames[0];
  const linkedValue = game.account === "steam" ? user.steamId : user.rivalsUid;
  const accountName = game.account === "steam" ? "Steam account" : "Marvel Rivals UID";

  let panel;
  if (!linkedValue) {
    panel = (
      <div className="stats-card">
        <p className="muted" style={{ marginBottom: isOwn ? 12 : 0 }}>
          {isOwn
            ? `Link your ${accountName} to see your ${game.name} stats here.`
            : `${user.name} hasn't linked a ${accountName} yet.`}
        </p>
        {isOwn && (
          <button type="button" className="btn-primary" onClick={onLinkAccounts}>
            Link {game.account === "steam" ? "Steam" : "Rivals UID"}
          </button>
        )}
      </div>
    );
  } else if (game.id === "deadlock") {
    panel = (
      <>
        <DeadlockStats steamId={user.steamId} recentCount={5} />
        <RankComparison steamId={user.steamId} />
      </>
    );
  } else {
    panel = <div className="stats-card muted">{game.name} stats are coming soon.</div>;
  }

  return (
    <section className="profile-game-stats">
      <div className="game-switcher" role="tablist">
        {myGames.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === game.id}
            className={g.id === game.id ? "game-switch active" : "game-switch"}
            style={{ "--accent": g.color }}
            onClick={() => setSelectedId(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="game-switch-panel" style={{ "--accent": game.color }}>
        {panel}
      </div>
    </section>
  );
}