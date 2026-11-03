import { useRef, useState } from "react";
import GamePicker from "./GamePicker";
import Avatar from "./Avatar";
import { updateAccount, resizeImage } from "../Data/accounts";

export default function EditProfileModal({ user, onSave, onClose }) {
  const fileInput = useRef(null);
  const [avatar, setAvatar] = useState(user.avatar ?? null);
  const [picked, setPicked] = useState(user.games ?? []);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows picking the same file again
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    try {
      setError("");
      setAvatar(await resizeImage(file)); // preview only until Save
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAccount(user.name, { avatar, games: picked });
    onSave({ ...user, avatar, games: picked });
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
        {error && <p className="form-error">{error}</p>}

        <p className="field-label">Games you play</p>
        <GamePicker picked={picked} setPicked={setPicked} />

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
}