import { useState } from "react";
import ModalBackdrop from "./ModalBackdrop";
import { updateProfile, parseSteamId, RIVALS_UID_RE } from "../Data/accounts";

function friendlyError(err) {
  const msg = err?.message ?? "";
  if (err?.code === "23505") {
    if (msg.includes("steam_id")) return "That Steam account is already linked to another RankedGamer account.";
    if (msg.includes("rivals_uid")) return "That Marvel Rivals UID is already linked to another RankedGamer account.";
  }
  return msg || "Couldn't save your linked accounts.";
}

export default function LinkAccountsModal({ user, onSave, onClose }) {
  const [steamInput, setSteamInput] = useState(user.steamId ?? "");
  const [rivalsInput, setRivalsInput] = useState(user.rivalsUid ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const steamId = parseSteamId(steamInput);
    if (steamId === undefined) {
      return setError("That doesn't look like a Steam ID. Use the 17-digit number starting with 7656119, or your steamcommunity.com/profiles/ link.");
    }

    const rivalsUid = rivalsInput.trim() || null;
    if (rivalsUid && !RIVALS_UID_RE.test(rivalsUid)) {
      return setError("Your Marvel Rivals UID should be numbers only.");
    }

    setBusy(true);
    try {
      // only these two fields are sent; everything else on the profile stays the same
      const saved = await updateProfile(user.id, { steamId, rivalsUid });
      onSave({ ...user, ...saved });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <form className="modal" onSubmit={handleSubmit}>
        <h2>Link accounts</h2>
        <p className="field-label muted">
          Link your game accounts so your stats show up on your profile and game tabs.
        </p>

        <label className="field">
          Steam ID (Deadlock, CS2)
          <input
            value={steamInput}
            onChange={(e) => setSteamInput(e.target.value)}
            placeholder="7656119XXXXXXXXXX or your Steam profile link"
            autoFocus
          />
          <span className="field-hint">
            In Steam, open your account name → Account details. Your Steam ID is shown under your name.
          </span>
        </label>

        <label className="field">
          Marvel Rivals UID
          <input
            value={rivalsInput}
            onChange={(e) => setRivalsInput(e.target.value)}
            placeholder="Numbers only"
            inputMode="numeric"
          />
          <span className="field-hint">Shown on your in-game profile in Marvel Rivals.</span>
        </label>

        <p className="field-hint" style={{ marginBottom: 16 }}>
          Leave a field empty to unlink that account.
        </p>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}