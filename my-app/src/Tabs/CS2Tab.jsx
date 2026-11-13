import PlayerSearch from "../Components/PlayerSearch";
import CS2CasualTab from "./CS2CasualTab";
import CS2CompetitiveTab from "./CS2CompetitiveTab";
import { useState } from 'react';

export default function CS2Tab() {
  //use no tab active
  const [activeMode, setActiveMode] = useState(null);

  //if a supporting tab is selected render it fully
  if(activeMode === 'casual')
  {
    return <CS2CasualTab onBack ={() => setActiveMode(null)} />;
  }
  if(activeMode === 'competitive')
  {
    return <CS2CompetitiveTab onBack ={() => setActiveMode(null)} />;
  }

  return (
    <div
        style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/public/1329760.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '85vh',
        padding: '30px',
        borderRadius: '12px',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
        }}
    >
      <div>
        <h2> Counter Strike Two </h2>
        <PlayerSearch />
        <p> Welcome to the CS2 tab!</p>

        {/* Related Tab navigation */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => setActiveMode('casual')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMode === 'casual' ? '#ff4655' : '#333',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
          Casual Statistics
          </button>
          <button
            onClick={() => setActiveMode('competitive')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMode === 'competitive' ? '#ff4655' : '#333',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Competitive Statistics
          </button>
        </div>
      </div>

      <footer style={{ marginTop: '40px', fontSize: '0.8rem', color: '#aaa', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '15px' }}>
        <p>Asset Credits: Card art by Magnific[cite: 7] | Backgrounds by kjpargeter[cite: 6] and starline[cite: 5] on Magnific</p>
      </footer>
    </div>
  );
}