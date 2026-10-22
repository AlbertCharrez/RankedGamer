import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import HomeTab from './Tabs/HomeTab';
import AboutTab from './Tabs/AboutTab';
import ContactTab from './Tabs/ContactTab';
import SearchBubble from './Components/SearchBubble.jsx';
import GamePage from './Tabs/GeneralGamePage.jsx';
import TabManager from './Components/TabManager.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('home');


  return (
    <TabManager />;
    <div>
      <div style = {{display: 'flex', justifyContent: 'center', gap: '10px'}}>
        <button onClick={() => setActiveTab('home')}>Home</button>
        <button onClick={() => setActiveTab('about')}>About</button>
        <button onClick={() => setActiveTab('contact')}>Contact</button>
      </div>

      <div style ={{marginTop: '20px'}}>
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'about' && <AboutTab />}
        {activeTab === 'contact' && <ContactTab />}
      </div>

      <div>
        <div style = {{display: 'flex', justifyContent: 'center', gap: '5px'}}>
          <button onClick={() => setActiveTab('gamePage')}>Game Page</button>
          <button onClick={() => setActiveTab('gamePage')}>Game Page</button>
          <button onClick={() => setActiveTab('gamePage')}>Game Page</button>
        </div>

      </div>
      <SearchBubble />
      <searchBubble onSearch={(q) => console.log("Searching for", q)} />
    </div>
  );
}

export default App;






































