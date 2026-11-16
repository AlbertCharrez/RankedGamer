import { useRef, useState } from "react";
import ModalBackdrop from "./ModalBackdrop";
import GamePicker from "./GamePicker";
import Avatar from "./Avatar";
import { updateProfile, resizeImage, isUsernameTaken, USERNAME_RE } from "../Data/accounts";

export default function EditProfileModal({ user, onSave, onClose }) {
  const fileInput = useRef(null);
  const [username, setUsername] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar ?? null);
  const [picked, setPicked] = useState(user.games ?? []);
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

    setBusy(true);
    try {
      const changedName = name.toLowerCase() !== user.name.toLowerCase();
      if (changedName && (await isUsernameTaken(name, user.id))) {
        return setError("That username is already taken.");
      }

      const saved = await updateProfile(user.id, { username: name, avatar, games: picked });
      onSave({ ...user, ...saved });
    } catch (err) {
      setError(err?.code === "23505" ? "That username is already taken." : err.message || "Couldn't save your profile.");
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