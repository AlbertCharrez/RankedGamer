import { useState } from "react";
import ModalBackdrop from "./ModalBackdrop";
import { updatePassword } from "../Data/accounts";

export default function ResetPasswordModal({ onClose }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setBusy(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err?.message || "Couldn't update your password. Try the reset link again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      {done ? (
        <div className="modal">
          <h2>Password updated</h2>
          <p className="field-label">You're all set, and you're logged in with your new password.</p>
          <div className="modal-actions">
            <button type="button" className="btn-primary" onClick={onClose}>Continue</button>
          </div>
        </div>
      ) : (
        <form className="modal" onSubmit={handleSubmit}>
          <h2>Set a new password</h2>

          <label className="field">
            New password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   placeholder="At least 8 characters" autoComplete="new-password" autoFocus />
          </label>

          <label className="field">
            Confirm new password
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                   autoComplete="new-password" />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Saving..." : "Save password"}
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  );
}