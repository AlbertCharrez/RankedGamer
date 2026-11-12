import Avatar from "./Avatar";
import { steamProfileUrl } from "../Data/accounts";

export default function LinkedAccountBanner({ game, person, isOwn, onClear }) {
  if (!person) {
    return (
      <div className="linked-banner">
        <span className="muted">Log in and link your accounts to see your info here.</span>
      </div>
    );
  }

  const usesSteam = game.account === "steam";
  const value = usesSteam ? person.steamId : person.rivalsUid;
  const what = usesSteam ? "a Steam account" : "a Marvel Rivals UID";

  return (
    <div className="linked-banner">
      <Avatar user={person} size="small" />

      <div className="linked-banner-text">
        <strong>{isOwn ? "You" : `Viewing ${person.name}`}</strong>
        {!value ? (
          <span className="muted">
            {isOwn ? `You haven't linked ${what} yet. Add it in Edit profile.` : `${person.name} hasn't linked ${what}.`}
          </span>
        ) : usesSteam ? (
          <span>
            Steam:{" "}
            <a className="link-btn" href={steamProfileUrl(value)} target="_blank" rel="noreferrer">
              {value} ↗
            </a>
          </span>
        ) : (
          <span>Marvel Rivals UID: {value}</span>
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