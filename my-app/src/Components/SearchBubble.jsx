import { useState } from "react";
import "./SearchBubble.css";

export default function SearchBubble({ onSearch }) {
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || pending) return; // ignore empty or duplicate submits

    setPending(true);
    try {
      await onSearch?.(q);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      className={`search-bubble ${pending ? "is-pending" : ""}`}
      onSubmit={handleSubmit}
      aria-busy={pending}
    >
      {pending ? (
        <span className="spinner" aria-label="Searching" />
      ) : (
        <span className="search-icon">🔍</span>
      )}

      <input
        type="text"
        placeholder={pending ? "Searching..." : "Search..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={pending}
      />

      {query && !pending && (
        <button type="button" className="clear-btn" onClick={() => setQuery("")}>
          ✕
        </button>
      )}
    </form>
  );
}