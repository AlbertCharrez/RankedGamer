import { useEffect, useRef, useState } from "react";
import HomeTab from "./Tabs/HomeTab";
import GameTab from "./Tabs/GameTab";
import ProfileTab from "./Tabs/ProfileTab";
import LoginModal from "./Components/LoginModal";
import SignupModal from "./Components/SignupModal";
import ForgotPasswordModal from "./Components/ForgotPasswordModal";
import ResetPasswordModal from "./Components/ResetPasswordModal";
import EditProfileModal from "./Components/EditProfileModal";
import LinkAccountsModal from "./Components/LinkAccountsModal";
import SupportModal from "./Components/SupportModal";
import Avatar from "./Components/Avatar";
import { supabase } from "./lib/supabaseClient";
import { fetchProfile, fetchProfileByUsername, logOut } from "./Data/accounts";
import { games } from "./Data/games";

const TAB_IDS = ["home", ...games.map((g) => g.id), "profile"];

// "/deadlock" -> { tab: "deadlock" },  "/u/Albert/cs2" -> { tab: "cs2", username: "Albert" }
function readUrl() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] === "u" && parts[1]) {
    const tab = TAB_IDS.includes(parts[2]) ? parts[2] : "profile";
    return { tab, username: decodeURIComponent(parts[1]) };
  }
  return { tab: TAB_IDS.includes(parts[0]) ? parts[0] : "home", username: null };
}

// current tab + viewed player -> URL
function buildUrl(tab, viewed) {
  if (viewed) {
    const base = `/u/${encodeURIComponent(viewed.name)}`;
    return tab === "profile" ? base : `${base}/${tab}`;
  }
  return tab === "home" ? "/" : `/${tab}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => readUrl().tab);
  const [user, setUser] = useState(null);             // who's logged in
  const [viewedUser, setViewedUser] = useState(null); // someone else's profile, or null = me
  const [authReady, setAuthReady] = useState(false);
  const [modal, setModal] = useState(null); // null | "login" | "signup" | "forgot" | "reset" | "edit" | "link" | "support"
  const urlReady = useRef(false); // false while we're reading the URL, so we don't overwrite it

  // login state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setModal("reset"); // arrived from a password reset email
      setTimeout(async () => {
        setUser(await fetchProfile(session?.user));
        setAuthReady(true);
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  // URL -> state (page load and Back/Forward)
  useEffect(() => {
    const applyUrl = async () => {
      urlReady.current = false;
      const { tab, username } = readUrl();
      setActiveTab(tab);

      try {
        if (!username) {
          setViewedUser(null);
          return;
        }
        const profile = await fetchProfileByUsername(username);
        setViewedUser(profile);
        if (!profile) setActiveTab("home"); // no one by that name
      } catch {
        setViewedUser(null);
        setActiveTab("home");
      } finally {
        urlReady.current = true;
      }
    };

    applyUrl();
    window.addEventListener("popstate", applyUrl);
    return () => window.removeEventListener("popstate", applyUrl);
  }, []);

  // state -> URL (skipped while the URL is being read)
  useEffect(() => {
    if (!urlReady.current) return;
    const url = buildUrl(activeTab, viewedUser);
    if (url !== window.location.pathname) window.history.pushState(null, "", url);
  }, [activeTab, viewedUser]);

  // the profile the tabs are showing: someone you clicked on, or yourself
  const person = viewedUser ?? user;
  const isOwn = !!user && person?.id === user.id;

  const closeModal = () => setModal(null);

  const openProfile = (p, tab = "profile") => {
    setViewedUser(user && p.id === user.id ? null : p);
    setActiveTab(tab);
  };

  const backToMe = () => {
    setViewedUser(null);
    if (!user) setActiveTab("home");
  };

  const handleSave = (u) => {
    setUser(u);
    setViewedUser(null);
    setModal(null);
    setActiveTab("profile");
  };

  const handleLogout = async () => {
    await logOut();
    setUser(null);
    setViewedUser(null);
    setActiveTab("home");
  };

  const tabs = {
home: {
  label: "Home",
  content: (
    <HomeTab
      onOpenTab={setActiveTab}
      onOpenProfile={openProfile}
    />
  ),
},

...Object.fromEntries(
  games.map((g) => [
    g.id,
    {
      label: g.name,
      content: (
        <GameTab
          game={g}
          person={person}
          isOwn={isOwn}
          onClearViewed={viewedUser ? backToMe : null}
          onLinkAccounts={() => setModal("link")}
        />
      ),
    },
  ])
),

deadlock: {
  label: "Deadlock",
  content: (
    <DeadlockTab
      isLoggedIn={!!user}
      user={user}
      onLoginClick={() => setModal("login")}
      onSignupClick={() => setModal("signup")}
    />
  ),
},
  };

  let content;
  if (activeTab === "profile" && !person && !authReady) {
    content = null; // still checking who's logged in
  } else if (activeTab === "profile" && person) {
    content = (
      <ProfileTab
        user={person}
        isOwn={isOwn}
        onOpenTab={setActiveTab}
        onEdit={() => setModal("edit")}
        onLinkAccounts={() => setModal("link")}
        onLogout={handleLogout}
        onBackToMe={viewedUser ? backToMe : null}
      />
    );
  } else {
    content = (tabs[activeTab] ?? tabs.home).content;
  }

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

        {!authReady ? null : user ? (
          <button
            className={activeTab === "profile" && isOwn ? "profile-btn active" : "profile-btn"}
            onClick={() => {
              setViewedUser(null);
              setActiveTab("profile");
            }}
          >
            <Avatar user={user} size="small" />
            {user.name}
          </button>
        ) : (
          <div className="auth-buttons">
            <button className="btn-primary" onClick={() => setModal("login")}>Log in</button>
            <button className="btn-signup" onClick={() => setModal("signup")}>Sign up</button>
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
          onForgotPassword={() => setModal("forgot")}
        />
      )}
      {modal === "signup" && (
        <SignupModal onClose={closeModal} onSwitchToLogin={() => setModal("login")} />
      )}
      {modal === "forgot" && (
        <ForgotPasswordModal onClose={closeModal} onBackToLogin={() => setModal("login")} />
      )}
      {modal === "reset" && <ResetPasswordModal onClose={closeModal} />}
      {modal === "edit" && user && (
        <EditProfileModal user={user} onSave={handleSave} onClose={closeModal} />
      )}
      {modal === "link" && user && (
        <LinkAccountsModal user={user} onSave={handleSave} onClose={closeModal} />
      )}
      {modal === "support" && <SupportModal user={user} onClose={closeModal} />}
    </div>
  );
}