import { useState } from "react";
import HomeTab from "./Tabs/HomeTab";
import DeadlockTab from "./Tabs/DeadlockTab";
import MarvelRivalsTab from "./Tabs/MarvelRivalsTab";
import CS2Tab from "./Tabs/CS2Tab";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  // id -> label shown on the tab button + component to render
  const tabs = {
    home:         { label: "Home",          content: <HomeTab onOpenTab={setActiveTab} /> },
    deadlock:     { label: "Deadlock",      content: <DeadlockTab /> },
    marvelrivals: { label: "Marvel Rivals", content: <MarvelRivalsTab /> },
    cs2:          { label: "CS2",           content: <CS2Tab /> },
  };

  return (
    <div style={{ padding: 24 }}>
      <nav className="tab-bar">
        {Object.entries(tabs).map(([id, tab]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={activeTab === id ? "tab active" : "tab"}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {tabs[activeTab].content}
    </div>
  );
}