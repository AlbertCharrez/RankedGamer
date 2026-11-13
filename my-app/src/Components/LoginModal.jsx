import { useState } from "react";
import { loadAccounts, accountKey, hashPassword } from "../Data/accounts";

export default function LoginModal({ onLogin, onClose, onSwitchToSignup }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    const account = loadAccounts()[accountKey(name)];

    // username doesn't exist
    if (!account) {
      setError("No account found with that username.");
      return;
    }

    // username exists, but the password is wrong
    if (account.hash !== (await hashPassword(password))) {
      setError("Incorrect password. Please try again.");
      return;
    }

    onLogin({ name: account.name, games: account.games ?? [] });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Log in</h2>

        <label className="field">
          Username
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p className="form-error">
            {error}
            {error.startsWith("No account") && (
              <>
                {" "}
                <button type="button" className="link-btn" onClick={onSwitchToSignup}>
                  Sign up instead?
                </button>
              </>
            )}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Log in</button>
        </div>

        <p className="switch-auth">
          Don't have an account?{" "}
          <button type="button" className="link-btn" onClick={onSwitchToSignup}>Sign up</button>
        </p>
      </form>
    </div>
  );
}