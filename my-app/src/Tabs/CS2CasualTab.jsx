import React from 'react';
import PlayerSearch from "../Components/PlayerSearch";
import StatCard from '../Components/Cs2cmp';

export default function CS2CasualTab({ onBack }) {
  // Uses same card layout as competetive without the ranked cart
  const casualCards = [
    { 
      type: 'combined', 
      label: 'Damage / Round', 
      value: '148.0', 
      sub: 'Unrated Avg', 
      secondLabel: 'K/D Ratio', 
      secondValue: '1.31', 
      secondSub: '890 K / 679 D' 
    },
    { type: 'rival', label: 'Last Match Rival', player: 'ViperMain99', headToHead: '4 - 3', detail: 'Most used: Phantom' },
    { label: 'Headshot %', value: '24.1%', sub: '214 Total HS' },
    { label: 'Win Rate', value: '58.0%', sub: '58W - 42L' },
    { label: 'Matches Played', value: '100', sub: 'Casual Queue' }
  ];

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.75)), url('/background2cs2.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '85vh',
        padding: '30px',
        borderRadius: '12px',
        color: 'white',
      }}
    >
      <button 
        onClick={onBack}
        style={{ 
          padding: '8px 16px', 
          marginBottom: '20px', 
          cursor: 'pointer',
          background: 'rgba(15, 15, 15, 0.85)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          fontWeight: '600',
          borderRadius: '4px'
        }}
      >
        ← Back to Main CS2 Page
      </button>

      <h2 style={{ marginBottom: '15px' }}>Casual CS2 Statistics</h2>
      <PlayerSearch />

      {/* Card Grid layout */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.5rem', 
          marginTop: '2rem' 
        }}
      >
        {casualCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}