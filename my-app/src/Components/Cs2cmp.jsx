import React from 'react';
import './Cs2cmp.css';

export default function StatCard({ label, value, sub, type, tier, rr, icon, player, headToHead, detail, secondLabel, secondValue, secondSub }) {
  
  // 1. Rank Card Layout
  if (type === 'rank') {
    return (
      <div className="stat-card">
        <div className="card-content">
          <div className="stat-label">{label}</div>
          <img src={icon} alt={tier} className="rank-icon" onError={(e) => e.target.style.display='none'} />
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{tier}</div>
          <div className="rr-bar-bg">
            <div className="rr-bar-fill" style={{ width: `${rr}%` }}></div>
          </div>
          <div className="stat-sub">{rr} / 100 RR</div>
        </div>
      </div>
    );
  }

  // 2. Nemesis Card Layout
  if (type === 'rival') {
    return (
      <div className="stat-card">
        <div className="card-content">
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{player}</div>
          <div className="stat-value" style={{ fontSize: '1.8rem', color: '#ff2a3c' }}>{headToHead}</div>
          <div className="stat-sub">{detail}</div>
        </div>
      </div>
    );
  }

  // 3.Damage per round along with Kill death ratio
  if (type === 'combined') {
    return (
      <div className="stat-card">
        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%' }}>
          <div>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>{value}</div>
            <div className="stat-sub" style={{ marginBottom: '0.8rem' }}>{sub}</div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '0.6rem' }}>
            <div className="stat-label">{secondLabel}</div>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>{secondValue}</div>
            <div className="stat-sub">{secondSub}</div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Standard card
  return (
    <div className="stat-card">
      <div className="card-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
      </div>
    </div>
  );
}