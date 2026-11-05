import { useRef, useState } from "react";
import GamePicker from "./GamePicker";
import Avatar from "./Avatar";
import { updateProfile, resizeImage } from "../Data/accounts";

export default function EditProfileModal({ user, onSave, onClose }) {
  const fileInput = useRef(null);
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
      setAvatar(await resizeImage(file)); // preview only until Save
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await updateProfile(user.id, { avatar, games: picked });
      onSave({ ...user, avatar, games: picked });
    } catch (err) {
      setError(err.message || "Couldn't save your profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Edit profile</h2>

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
    </div>
  );
}