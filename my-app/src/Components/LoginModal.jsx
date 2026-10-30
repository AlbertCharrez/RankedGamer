import { useState } from "react";
import { games } from "../Data/games";

export default function LoginModal({ initialUser, onSave, onClose }) {
  const [name, setName] = useState(initialUser?.name ?? "");
  const [picked, setPicked] = useState(initialUser?.games ?? []);

  const toggleGame = (id) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), games: picked });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{initialUser ? "Edit profile" : "Log in"}</h2>

        <label className="field">
          Username
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your gamertag" autoFocus />
        </label>

        <p className="field-label">Games you play</p>
        <div className="game-checks">
          {games.map((g) => (
            <label key={g.id} className={picked.includes(g.id) ? "game-check checked" : "game-check"}>
              <input type="checkbox" checked={picked.includes(g.id)} onChange={() => toggleGame(g.id)} />
              {g.name}
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
}