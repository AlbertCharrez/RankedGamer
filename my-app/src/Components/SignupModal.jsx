import { useState } from "react";
import GamePicker from "./GamePicker";
import { loadAccounts, saveAccounts, accountKey, hashPassword } from "../Data/accounts";

export default function SignupModal({ onSignup, onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [hash, setHash] = useState("");
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");

  // Step 1: username + password
  const handleCredentials = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !password) return setError("Choose a username and password.");
    if (loadAccounts()[accountKey(name)]) return setError("That username is already taken.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setHash(await hashPassword(password));
    setStep(2);
  };

  // Step 2: games, then create the account
  const handleFinish = (e) => {
    e.preventDefault();
    const accounts = loadAccounts();
    const displayName = name.trim();
    accounts[accountKey(name)] = { name: displayName, hash, games: picked };
    saveAccounts(accounts);
    onSignup({ name: displayName, games: picked });
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {step === 1 ? (
        <form className="modal" onClick={stop} onSubmit={handleCredentials}>
          <p className="step-label">Step 1 of 2</p>
          <h2>Create an account</h2>

          <label className="field">
            Username
            <input value={name} onChange={(e) => setName(e.target.value)}
                   placeholder="Your gamertag" autoComplete="username" autoFocus />
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
            <button type="submit" className="btn-primary">Next</button>
          </div>

          <p className="switch-auth">
            Already have an account?{" "}
            <button type="button" className="link-btn" onClick={onSwitchToLogin}>Log in</button>
          </p>
        </form>
      ) : (
        <form className="modal" onClick={stop} onSubmit={handleFinish}>
          <p className="step-label">Step 2 of 2</p>
          <h2>Welcome, {name.trim()}!</h2>
          <p className="field-label">What games do you play?</p>

          <GamePicker picked={picked} setPicked={setPicked} />

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button type="submit" className="btn-primary">Finish</button>
          </div>
        </form>
      )}
    </div>
  );
}