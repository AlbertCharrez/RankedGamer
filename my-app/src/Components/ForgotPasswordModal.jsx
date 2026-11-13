import { useState } from "react";
import ModalBackdrop from "./ModalBackdrop";
import { sendPasswordReset } from "../Data/accounts";

export default function ForgotPasswordModal({ onClose, onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Enter your email.");

    setBusy(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err?.message?.toLowerCase().includes("rate limit")
          ? "Too many requests. Please wait a bit and try again."
          : "Couldn't send the reset email. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      {sent ? (
        <div className="modal">
          <h2>Check your email</h2>
          <p className="field-label">
            If an account exists for <strong>{email.trim()}</strong>, we sent a link to reset your password.
          </p>
          <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
            Don't see it? Check your spam folder.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn-primary" onClick={onClose}>Got it</button>
          </div>
        </div>
      ) : (
        <form className="modal" onSubmit={handleSubmit}>
          <h2>Reset your password</h2>
          <p className="field-label muted">Enter your email and we'll send you a reset link.</p>

          <label className="field">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   autoComplete="email" autoFocus />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onBackToLogin}>Back</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Sending..." : "Send link"}
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  );
}