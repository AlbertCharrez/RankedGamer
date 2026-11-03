import { useState } from "react";
import HomeTab from "./Tabs/HomeTab";
import DeadlockTab from "./Tabs/DeadlockTab";
import MarvelRivalsTab from "./Tabs/MarvelRivalsTab";
import CS2Tab from "./Tabs/CS2Tab";
import ProfileTab from "./Tabs/ProfileTab";
import LoginModal from "./Components/LoginModal";
import SignupModal from "./Components/SignupModal";
import EditProfileModal from "./Components/EditProfileModal";
import SupportModal from "./Components/SupportModal";
import Avatar from "./Components/Avatar";

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
  const [modal, setModal] = useState(null); // null | "login" | "signup" | "edit" | "support"

  const closeModal = () => setModal(null);

  // logging in, signing up, and editing the profile all end the same way
  const handleSave = (u) => {
    setUser(u);
    saveUser(u);
    setModal(null);
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
        onEdit={() => setModal("edit")}
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
            <Avatar user={user} size="small" />
            {user.name}
          </button>
        ) : (
          <div className="auth-buttons">
            <button className="btn-primary" onClick={() => setModal("login")}>
              Log in
            </button>
            <button className="btn-signup" onClick={() => setModal("signup")}>
              Sign up
            </button>
          </div>
        )}
      </nav>

      <main className="app-content">{content}</main>

      <footer className="site-footer">
        <span> RankedGamer @ ECU </span>
        <button className="btn-secondary" onClick={() => setModal("support")}>
          Need help? Contact support
        </button>
      </footer>

      {modal === "login" && (
        <LoginModal
          onLogin={handleSave}
          onClose={closeModal}
          onSwitchToSignup={() => setModal("signup")}
        />
      )}

      {modal === "signup" && (
        <SignupModal
          onSignup={handleSave}
          onClose={closeModal}
          onSwitchToLogin={() => setModal("login")}
        />
      )}

      {modal === "edit" && user && (
        <EditProfileModal user={user} onSave={handleSave} onClose={closeModal} />
      )}

      {modal === "support" && <SupportModal user={user} onClose={closeModal} />}
    </div>
  );
}