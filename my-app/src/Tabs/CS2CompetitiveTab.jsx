import React from 'react';
import PlayerSearch from "../Components/PlayerSearch";
import StatCard from '../Components/Cs2cmp';

export default function CS2CompetitiveTab({ onBack }) {
  // Competitive stats data array
  const competitiveCards = [
    { type: 'rank', label: 'Premier Rank', tier: 'Diamond II', rr: 75, icon: '/cs2character.png' },
    { 
      type: 'combined', 
      label: 'Damage / Round', 
      value: '154.2', 
      sub: 'Top 15% Rating', 
      secondLabel: 'K/D Ratio', 
      secondValue: '1.24', 
      secondSub: '412 K / 332 D' 
    },
    { type: 'rival', label: 'Last Match Rival', player: 'xX_Shadow_Xx', headToHead: '2 - 6', detail: 'Most used: AK-47' },
    { label: 'Headshot %', value: '26.8%', sub: '110 Total HS' },
    { label: 'Win Rate', value: '54.5%', sub: '24W - 20L' }
  ];

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.75)), url('/413301638_4a2518e2-b7a8-467a-8cac-925f6e5250eb (1).jpg')`,
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
          fontWeight: '600'
        }}
      >
        ← Back to Main CS2 Page
      </button>

      <h2 style={{ marginBottom: '15px' }}>Competitive CS2 Statistics</h2>
      <PlayerSearch />

      {/* Card Grid structuer */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.5rem', 
          marginTop: '2rem' 
        }}
      >
        {competitiveCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}
