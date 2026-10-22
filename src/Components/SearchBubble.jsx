import {useState} from 'react'
import "./SearchBubble.css"

export default function SearchBubble({onSearch}) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch?.(query);
};

return (
    <form className="search-bubble" onSubmit={handleSubmit}>
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button type="button" className="clear-btn" onClick={() => setQuery("")}>
            ✕
        </button>
      )}
    </form>
  );
}