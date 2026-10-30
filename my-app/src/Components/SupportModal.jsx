import { useState } from "react";

const SUPPORT_EMAIL = "rankedgamersupp@gmail.com";
const TOPICS = [
  "I can't log in",
  "I forgot my password",
  "Change my username or games",
  "Delete my account",
  "Report a bug",
  "Something else",
];

export default function SupportModal({ user, onClose }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return setError("Please describe the problem.");

    const subject = `[RankedGamer Support] ${topic}`;
    const body =
      `Username: ${user?.name ?? "Not logged in"}\n` +
      `Topic: ${topic}\n\n` +
      message.trim();

    window.location.href =
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Contact support</h2>
        <p className="field-label">
          {user ? `Logged in as ${user.name}` : "You're not logged in. That's okay, we can still help."}
        </p>

        <label className="field">
          What do you need help with?
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>

        <label className="field">
          Details
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what happened..."
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Send</button>
        </div>

        <p className="switch-auth">
          Or email us directly at{" "}
          <a className="link-btn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </form>
    </div>
  );
}