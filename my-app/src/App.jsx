import { useState } from "react";
import HomeTab from "./Tabs/HomeTab";
import CS2Tab from "./Tabs/CS2Tab";
import DeadlockTab from "./Tabs/DeadlockTab";
import MarvelRivalsTab from "./Tabs/MarvelRivalsTab";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["home", "cs2", "deadlock", "marvel rivals"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ fontWeight: activeTab === tab ? "bold" : "normal" }}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {activeTab === "home" && <HomeTab />}
      {activeTab === "cs2" && <CS2Tab />}
      {activeTab === "deadlock" && <DeadlockTab />}
      {activeTab === "marvel rivals" && <MarvelRivalsTab />}
    </div>
  );
}

export default App;