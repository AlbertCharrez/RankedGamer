import { useState } from "react";
import GamePicker from "./GamePicker";
import { loadAccounts, saveAccounts, accountKey } from "../Data/accounts";

export default function EditGamesModal({ user, onSave, onClose }) {
  const [picked, setPicked] = useState(user.games ?? []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const accounts = loadAccounts();
    const key = accountKey(user.name);
    if (accounts[key]) {
      accounts[key] = { ...accounts[key], games: picked };
      saveAccounts(accounts);
    }
    onSave({ ...user, games: picked });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Edit your games</h2>
        <p className="field-label">What games do you play?</p>

        <GamePicker picked={picked} setPicked={setPicked} />

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
}