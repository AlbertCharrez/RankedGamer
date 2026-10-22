import {useState} from 'react';
import HomeTab from './Tabs/HomeTab';
import AboutTab from './Tabs/AboutTab';
import ContactTab from './Tabs/ContactTab';
import GamePage from './Tabs/GeneralGamePage.jsx';

const TABS = [
    {id: 'home', label: 'Home', component: HomeTab},
    {id: 'about', label: 'About', component: AboutTab},
    {id: 'contact', label: 'Contact', component: ContactTab},
    {id: 'gamePage', label: 'Game Page', component: GamePage}
]

export default function TabManager() {
    const [activeId, setActiveId] = useState("home");
    const ActiveTab = TABS.find((t) => t.id === activeId).component;

    return (
        <div>
            {TABS.map((tab) => (
                <button
                    key={t.id}
                    className={t.id === activeId ? "active" : ""}
                    onClick={() => setActiveId(t.id)}
                    >
                    {t.label} 
                    </button>
            ))}
        </div>
    )

}