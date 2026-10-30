import { games } from "../Data/games";

export default function ProfileTab({ user, onOpenTab, onEdit, onLogout }) {
  const myGames = games.filter((g) => user.games.includes(g.id));

  return (
    <div className="profile">
      <header className="profile-header">
        <div className="avatar">{user.name[0].toUpperCase()}</div>
        <div>
          <h1>{user.name}</h1>
          <p>{myGames.length} game{myGames.length === 1 ? "" : "s"}</p>
        </div>
        <div className="profile-actions">
          <button className="btn-secondary" onClick={onEdit}>Edit</button>
          <button className="btn-secondary" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <h2>Games I play</h2>
      {myGames.length === 0 ? (
        <p>No games picked yet. Click Edit to add some.</p>
      ) : (
        <section className="game-grid">
          {myGames.map((g) => (
            <button key={g.id} type="button" className="game-card"
                    style={{ "--accent": g.color }} onClick={() => onOpenTab(g.id)}>
              <img src={g.image} alt={g.name} />
              <span>{g.name}</span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}