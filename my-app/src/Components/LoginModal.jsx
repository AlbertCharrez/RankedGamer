import { useState } from "react";
import ModalBackdrop from "./ModalBackdrop";
import { logIn } from "../Data/accounts";

function friendlyError(err) {
  const msg = err?.message ?? "";
  if (msg.includes("Invalid login credentials")) return "Incorrect email or password.";
  if (msg.includes("Email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  return msg || "Something went wrong. Please try again.";
}

export default function LoginModal({ onLogin, onClose, onSwitchToSignup, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Enter your email and password.");

    setBusy(true);
    try {
      const user = await logIn(email.trim(), password);
      if (!user) return setError("Logged in, but your profile couldn't be loaded.");
      onLogin(user);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <form className="modal" onSubmit={handleSubmit}>
        <h2>Log in</h2>

        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 autoComplete="email" autoFocus />
        </label>

        <label className="field">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 autoComplete="current-password" />
        </label>

        <button
          type="button"
          className="link-btn small"
          style={{ marginTop: -8, marginBottom: 16 }}
          onClick={onForgotPassword}
        >
          Forgot password?
        </button>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Logging in..." : "Log in"}
          </button>
        </div>

        <p className="switch-auth">
          Don't have an account?{" "}
          <button type="button" className="link-btn" onClick={onSwitchToSignup}>Sign up</button>
        </p>
      </form>
    </ModalBackdrop>
  );
}