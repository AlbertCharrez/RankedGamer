import { useState } from "react";
import GamePicker from "./GamePicker";
import { isUsernameTaken, signUp } from "../Data/accounts";

const USERNAME_RE = /^[A-Za-z0-9_.-]{3,20}$/;

function friendlyError(err) {
  const msg = err?.message ?? "";
  if (msg.includes("Database error")) return "That username was just taken. Go back and pick another.";
  if (msg.toLowerCase().includes("rate limit")) return "Too many sign-up attempts. Please wait a bit and try again.";
  return msg || "Something went wrong. Please try again.";
}

export default function SignupModal({ onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1); // 1 = details, 2 = games, 3 = check email
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Step 1: email, username, password
  const handleDetails = async (e) => {
    e.preventDefault();
    setError("");
    const name = username.trim();

    if (!email.trim() || !name || !password) return setError("Please fill in every field.");
    if (!USERNAME_RE.test(name)) return setError("Username must be 3–20 characters: letters, numbers, _ . or -");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setBusy(true);
    try {
      if (await isUsernameTaken(name)) return setError("That username is already taken.");
      setStep(2);
    } catch {
      setError("Couldn't check that username. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Step 2: games, then create the account
  const handleFinish = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await signUp({
        email: email.trim(),
        password,
        username: username.trim(),
        games: picked,
      });

      // Supabase returns a user with no identities if the email is already registered
      if (data.user && data.user.identities?.length === 0) {
        setError("An account with that email already exists. Try logging in instead.");
        return;
      }
      setStep(3);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {step === 1 && (
        <form className="modal" onClick={stop} onSubmit={handleDetails}>
          <p className="step-label">Step 1 of 2</p>
          <h2>Create an account</h2>

          <label className="field">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   autoComplete="email" autoFocus />
          </label>

          <label className="field">
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)}
                   placeholder="Your gamertag" autoComplete="username" />
          </label>

          <label className="field">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   placeholder="At least 6 characters" autoComplete="new-password" />
          </label>

          <label className="field">
            Confirm password
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                   autoComplete="new-password" />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Checking..." : "Next"}
            </button>
          </div>

          <p className="switch-auth">
            Already have an account?{" "}
            <button type="button" className="link-btn" onClick={onSwitchToLogin}>Log in</button>
          </p>
        </form>
      )}

      {step === 2 && (
        <form className="modal" onClick={stop} onSubmit={handleFinish}>
          <p className="step-label">Step 2 of 2</p>
          <h2>Welcome, {username.trim()}!</h2>
          <p className="field-label">What games do you play?</p>

          <GamePicker picked={picked} setPicked={setPicked} />

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Creating..." : "Finish"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="modal" onClick={stop}>
          <h2>Check your email</h2>
          <p className="field-label">
            We sent a confirmation link to <strong>{email.trim()}</strong>. Click it to activate
            your account. You'll be logged in automatically.
          </p>
          <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
            Don't see it? Check your spam folder.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn-primary" onClick={onClose}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}