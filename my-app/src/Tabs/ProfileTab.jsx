import { games } from "../Data/games";
import { steamProfileUrl } from "../Data/accounts";
import Avatar from "../Components/Avatar";
import GameCard from "../Components/GameCard";
import ProfileGameStats from "../Components/ProfileGameStats";

export default function ProfileTab({ user, isOwn, onOpenTab, onEdit, onLinkAccounts, onLogout, onBackToMe }) {
  const myGames = games.filter((g) => user.games.includes(g.id));
  const wasRenamed = isOwn && /^dunce\d+$/i.test(user.name);
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  // "Not linked" text, or a Link button on your own profile
  const notLinked = isOwn ? (
    <button type="button" className="link-btn" onClick={onLinkAccounts}>Link</button>
  ) : (
    <span className="muted">Not linked</span>
  );

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
              <button className="btn-secondary" onClick={onLinkAccounts}>Link Accounts</button>
              <button className="btn-secondary" onClick={onEdit}>Edit Profile</button>
              <button className="btn-secondary" onClick={onLogout}>Log Out</button>
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
            notLinked
          )}
        </div>
        <div className="linked-row">
          <span className="linked-label">Marvel Rivals UID</span>
          {user.rivalsUid ? <span>{user.rivalsUid}</span> : notLinked}
        </div>
      </div>

      {myGames.length > 0 && (
        <>
          <h2>Stats</h2>
          <ProfileGameStats user={user} isOwn={isOwn} onLinkAccounts={onLinkAccounts} />
        </>
      )}

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