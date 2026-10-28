import { useState } from "react";
import HomeTab from "./Tabs/HomeTab";
import AboutTab from "./Tabs/AboutTab";
import ContactTab from "./Tabs/ContactTab";
import SearchBubble from "./Components/SearchBubble.jsx";
import { fakeSearch } from "./Data/players";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [results, setResults] = useState(null); // null = not searched yet

  const changeTab = (tab) => {
    setActiveTab(tab);
    setResults(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["home", "about", "contact"].map((tab) => (
          <button
            key={tab}
            onClick={() => changeTab(tab)}
            style={{ fontWeight: activeTab === tab ? "bold" : "normal" }}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <SearchBubble
        key={activeTab} 
        onSearch={async (q) => {
          const data = await fakeSearch(q);
          setResults(data);
        }}
      />

      {results !== null && (
        <ul style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
          {results.length === 0 ? (
            <li>No players found.</li>
          ) : (
            results.map((p) => (
              <li key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid #333" }}>
                <strong>{p.name}</strong> · {p.game.toUpperCase()} · {p.rank} · K/D {p.kd}
              </li>
            ))
          )}
        </ul>
      )}

      <div style={{ marginTop: 24 }}>
        {activeTab === "home" && <HomeTab />}
        {activeTab === "about" && <AboutTab />}
        {activeTab === "contact" && <ContactTab />}
      </div>
    </div>
  );
}

export default App;