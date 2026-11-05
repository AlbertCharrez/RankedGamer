import PlayerSearch from "../Components/PlayerSearch";
import CS2CasualTab from "./CS2CasualTab";
import CS2CompetitiveTab from "./CS2CompetitiveTab";
import { useState } from 'react';


export default function CS2Tab() {
  return (
    <div
        style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/public/1329760.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '85vh',
        padding: '30px',
        borderRadius: '12px',
        color: 'white'
        }}
        >
        <h2> CS2 </h2>
        <PlayerSearch />
        <p> Welcome to the CS2 tab!</p>
      <h2>CS2</h2>

      {/* Related Tab navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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

      {/* Render Active View */}
      {activeMode === 'casual' ? <CS2CasualTab /> : <CS2CompetitiveTab />}
    </div>
  );
}
