import Avatar from "./Avatar";

const STEAM_GAMES = ["deadlock", "cs2"];
const steamUrl = (id) => `https://steamcommunity.com/profiles/${id}`;

export default function LinkedAccountBanner({ person, isOwn, game, onClear }) {
  if (!person) {
    return (
      <div className="linked-banner">
        <span className="muted">Log in and link your accounts to see your info here.</span>
      </div>
    );
  }

  const usesSteam = STEAM_GAMES.includes(game);
  const value = usesSteam ? person.steamId : person.rivalsUid;
  const what = usesSteam ? "a Steam account" : "a Marvel Rivals UID";

  return (
    <div className="linked-banner">
      <Avatar user={person} size="small" />

      <div className="linked-banner-text">
        <strong>{isOwn ? "You" : `Viewing ${person.name}`}</strong>
        {value ? (
          usesSteam ? (
            <span>
              Steam:{" "}
              <a className="link-btn" href={steamUrl(value)} target="_blank" rel="noreferrer">
                {value} ↗
              </a>
            </span>
          ) : (
            <span>Marvel Rivals UID: {value}</span>
          )
        ) : (
          <span className="muted">
            {isOwn
              ? `You haven't linked ${what} yet. Add it in Edit profile.`
              : `${person.name} hasn't linked ${what}.`}
          </span>
        )}
      </div>

      {onClear && (
        <button type="button" className="btn-secondary" onClick={onClear}>
          Stop viewing
        </button>
      )}
    </div>
  );
}