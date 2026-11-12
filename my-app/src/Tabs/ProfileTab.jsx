import { games } from "../Data/games";
import { steamProfileUrl } from "../Data/accounts";
import Avatar from "../Components/Avatar";
import GameCard from "../Components/GameCard";

export default function ProfileTab({ user, isOwn, onOpenTab, onEdit, onLogout, onBackToMe }) {
  const myGames = games.filter((g) => user.games.includes(g.id));
  const wasRenamed = isOwn && /^dunce\d+$/i.test(user.name);
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  return (
    <div className="profile">
      <header className="profile-header">
        <Avatar user={user} />

        <div>
          <h1>{user.name}</h1>
          <p>
            {myGames.length} game{myGames.length === 1 ? "" : "s"}
            {memberSince && ` · Member since ${memberSince}`}
          </p>
        </div>

        <div className="profile-actions">
          {isOwn ? (
            <>
              <button className="btn-secondary" onClick={onEdit}>Edit profile</button>
              <button className="btn-secondary" onClick={onLogout}>Log out</button>
            </>
          ) : (
            onBackToMe && <button className="btn-secondary" onClick={onBackToMe}>← Back</button>
          )}
        </div>
      </header>

      {wasRenamed && (
        <div className="notice">
          Your username wasn't allowed, so it was changed to <strong>{user.name}</strong>.
          Click <strong>Edit profile</strong> to choose a new one.
        </div>
      )}

      <h2>Linked accounts</h2>
      <div className="linked-accounts">
        <div className="linked-row">
          <span className="linked-label">Steam (Deadlock, CS2)</span>
          {user.steamId ? (
            <a className="link-btn" href={steamProfileUrl(user.steamId)} target="_blank" rel="noreferrer">
              {user.steamId} ↗
            </a>
          ) : (
            <span className="muted">Not linked</span>
          )}
        </div>
        <div className="linked-row">
          <span className="linked-label">Marvel Rivals UID</span>
          {user.rivalsUid ? <span>{user.rivalsUid}</span> : <span className="muted">Not linked</span>}
        </div>
      </div>

      <h2>{isOwn ? "Games I play" : `Games ${user.name} plays`}</h2>
      {myGames.length === 0 ? (
        <p className="muted">
          {isOwn ? "No games picked yet. Click Edit profile to add some." : "No games listed."}
        </p>
      ) : (
        <section className="game-grid">
          {myGames.map((g) => (
            <GameCard key={g.id} game={g} onClick={() => onOpenTab(g.id)} />
          ))}
        </section>
      )}
    </div>
  );
}