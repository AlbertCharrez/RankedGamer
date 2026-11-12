import { useRef, useState } from "react";
import ModalBackdrop from "./ModalBackdrop";
import GamePicker from "./GamePicker";
import Avatar from "./Avatar";
import {
  updateProfile,
  resizeImage,
  isUsernameTaken,
  parseSteamId,
  USERNAME_RE,
  RIVALS_UID_RE,
} from "../Data/accounts";

function friendlySaveError(err) {
  const msg = err?.message ?? "";
  if (err?.code === "23505") {
    if (msg.includes("steam_id")) return "That Steam account is already linked to another RankedGamer account.";
    if (msg.includes("rivals_uid")) return "That Marvel Rivals UID is already linked to another RankedGamer account.";
    return "That username is already taken.";
  }
  return msg || "Couldn't save your profile.";
}

export default function EditProfileModal({ user, onSave, onClose }) {
  const fileInput = useRef(null);
  const [username, setUsername] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar ?? null);
  const [picked, setPicked] = useState(user.games ?? []);
  const [steamInput, setSteamInput] = useState(user.steamId ?? "");
  const [rivalsInput, setRivalsInput] = useState(user.rivalsUid ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");

    try {
      setError("");
      setAvatar(await resizeImage(file));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const name = username.trim();

    if (!USERNAME_RE.test(name)) {
      return setError("Username must be 3–20 characters: letters, numbers, _ . or -");
    }

    const steamId = parseSteamId(steamInput);
    if (steamId === undefined) {
      return setError("That doesn't look like a Steam ID. Use the 17-digit number starting with 7656119, or your steamcommunity.com/profiles/ link.");
    }

    const rivalsUid = rivalsInput.trim() || null;
    if (rivalsUid && !RIVALS_UID_RE.test(rivalsUid)) {
      return setError("Your Marvel Rivals UID should be numbers only.");
    }

    setBusy(true);
    try {
      const changedName = name.toLowerCase() !== user.name.toLowerCase();
      if (changedName && (await isUsernameTaken(name, user.id))) {
        return setError("That username is already taken.");
      }

      const saved = await updateProfile(user.id, {
        username: name,
        avatar,
        games: picked,
        steamId,
        rivalsUid,
      });
      onSave({ ...user, ...saved });
    } catch (err) {
      setError(friendlySaveError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <form className="modal" onSubmit={handleSubmit}>
        <h2>Edit profile</h2>

        <label className="field">
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </label>

        <p className="field-label">Profile picture</p>
        <div className="avatar-picker">
          <Avatar user={{ ...user, avatar }} />
          <div className="avatar-picker-actions">
            <button type="button" className="btn-secondary" onClick={() => fileInput.current.click()}>
              {avatar ? "Change picture" : "Upload picture"}
            </button>
            {avatar && (
              <button type="button" className="link-btn small" onClick={() => setAvatar(null)}>
                Remove picture
              </button>
            )}
          </div>
          <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} hidden />
        </div>

        <p className="field-label">Games you play</p>
        <GamePicker picked={picked} setPicked={setPicked} />

        <p className="field-label">Linked accounts</p>

        <label className="field">
          Steam ID (Deadlock, CS2)
          <input
            value={steamInput}
            onChange={(e) => setSteamInput(e.target.value)}
            placeholder="7656119XXXXXXXXXX or your Steam profile link"
          />
          <span className="field-hint">
            In Steam, open your account name → Account details. Your Steam ID is shown under your name.
          </span>
        </label>

        <label className="field">
          Marvel Rivals UID
          <input
            value={rivalsInput}
            onChange={(e) => setRivalsInput(e.target.value)}
            placeholder="Numbers only"
            inputMode="numeric"
          />
          <span className="field-hint">Shown on your in-game profile in Marvel Rivals.</span>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}