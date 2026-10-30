import { useState } from "react";
import HomeTab from "./Tabs/HomeTab";
import DeadlockTab from "./Tabs/DeadlockTab";
import MarvelRivalsTab from "./Tabs/MarvelRivalsTab";
import CS2Tab from "./Tabs/CS2Tab";
import ProfileTab from "./Tabs/ProfileTab";
import LoginModal from "./Components/LoginModal";
import SupportModal from "./Components/SupportModal";

const loadUser = () => {
  try { return JSON.parse(localStorage.getItem("rg-user")); } catch { return null; }
};
const saveUser = (u) => {
  try {
    u ? localStorage.setItem("rg-user", JSON.stringify(u)) : localStorage.removeItem("rg-user");
  } catch {}
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState(loadUser);
  const [showLogin, setShowLogin] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const handleSave = (u) => {
    setUser(u);
    saveUser(u);
    setShowLogin(false);
    setActiveTab("profile");
  };

  const handleLogout = () => {
    setUser(null);
    saveUser(null);
    setActiveTab("home");
  };

  const tabs = {
    home:         { label: "Home",          content: <HomeTab onOpenTab={setActiveTab} /> },
    deadlock:     { label: "Deadlock",      content: <DeadlockTab /> },
    marvelrivals: { label: "Marvel Rivals", content: <MarvelRivalsTab /> },
    cs2:          { label: "CS2",           content: <CS2Tab /> },
  };

  const content =
    activeTab === "profile" && user ? (
      <ProfileTab
        user={user}
        onOpenTab={setActiveTab}
        onEdit={() => setShowLogin(true)}
        onLogout={handleLogout}
      />
    ) : (
      (tabs[activeTab] ?? tabs.home).content
    );

  return (
    <div className="app">
      <nav className="tab-bar">
        <div className="tab-group">
          {Object.entries(tabs).map(([id, tab]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={activeTab === id ? "tab active" : "tab"}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {user ? (
          <button
            className={activeTab === "profile" ? "profile-btn active" : "profile-btn"}
            onClick={() => setActiveTab("profile")}
          >
            <span className="avatar small">{user.name[0].toUpperCase()}</span>
            {user.name}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setShowLogin(true)}>
            Log in
          </button>
        )}
      </nav>

      <main className="app-content">{content}</main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} RankedGamer</span>
        <button className="btn-secondary" onClick={() => setShowSupport(true)}>
          Need help? Contact support
        </button>
      </footer>

      {showLogin && (
        <LoginModal
          initialUser={user}
          onSave={handleSave}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showSupport && (
        <SupportModal user={user} onClose={() => setShowSupport(false)} />
      )}
    </div>
  );
}