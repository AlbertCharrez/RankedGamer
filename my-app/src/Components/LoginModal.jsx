import { useState } from "react";
import { games } from "../Data/games";

const ACCOUNTS_KEY = "rg-accounts";

const loadAccounts = () => {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) ?? {}; } catch { return {}; }
};
const saveAccounts = (accounts) => {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch {}
};

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function LoginModal({ initialUser, onSave, onClose }) {
  const editing = Boolean(initialUser);

  // "login" | "signup" | "games"
  const [view, setView] = useState(editing ? "games" : "login");
  const [name, setName] = useState(initialUser?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [hash, setHash] = useState("");
  const [picked, setPicked] = useState(initialUser?.games ?? []);
  const [error, setError] = useState("");

  const key = name.trim().toLowerCase(); // usernames are case-insensitive

  const switchView = (next) => {
    setView(next);
    setError("");
    setPassword("");
    setConfirm("");
  };

  // ---------- Log in: check password, then go straight in ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !password) return setError("Enter your username and password.");

    const account = loadAccounts()[key];
    if (!account || account.hash !== (await hashPassword(password))) {
      return setError("Incorrect username or password.");
    }

    onSave({ name: account.name, games: account.games ?? [] });
  };

  // ---------- Sign up: check username is free, then pick games ----------
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !password) return setError("Choose a username and password.");
    if (loadAccounts()[key]) return setError("That username is already taken.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setHash(await hashPassword(password));
    setPicked([]);
    setView("games");
  };

  // ---------- Games: finish sign-up, or save edits ----------
  const toggleGame = (id) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const handleGames = (e) => {
    e.preventDefault();
    const accounts = loadAccounts();
    const existing = accounts[key];
    const displayName = existing?.name ?? name.trim();

    if (existing || hash) {
      accounts[key] = { name: displayName, hash: existing?.hash ?? hash, games: picked };
      saveAccounts(accounts);
    }

    onSave({ name: displayName, games: picked });
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {view === "login" && (
        <form className="modal" onClick={stop} onSubmit={handleLogin}>
          <h2>Log in</h2>

          <label className="field">
            Username
            <input value={name} onChange={(e) => setName(e.target.value)}
                   autoComplete="username" autoFocus />
          </label>

          <label className="field">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   autoComplete="current-password" />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Log in</button>
          </div>

          <p className="switch-auth">
            Don't have an account?{" "}
            <button type="button" className="link-btn" onClick={() => switchView("signup")}>Sign up</button>
          </p>
        </form>
      )}

      {view === "signup" && (
        <form className="modal" onClick={stop} onSubmit={handleSignup}>
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
            <button type="button" className="link-btn" onClick={() => switchView("login")}>Log in</button>
          </p>
        </form>
      )}

      {view === "games" && (
        <form className="modal" onClick={stop} onSubmit={handleGames}>
          {!editing && <p className="step-label">Step 2 of 2</p>}
          <h2>{editing ? "Edit your games" : `Welcome, ${name.trim()}!`}</h2>
          <p className="field-label">What games do you play?</p>

          <div className="game-checks">
            {games.map((g) => (
              <label key={g.id} className={picked.includes(g.id) ? "game-check checked" : "game-check"}>
                <input type="checkbox" checked={picked.includes(g.id)} onChange={() => toggleGame(g.id)} />
                {g.name}
              </label>
            ))}
          </div>

          <div className="modal-actions">
            {editing ? (
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => setView("signup")}>Back</button>
            )}
            <button type="submit" className="btn-primary">{editing ? "Save" : "Finish"}</button>
          </div>
        </form>
      )}
    </div>
  );
}