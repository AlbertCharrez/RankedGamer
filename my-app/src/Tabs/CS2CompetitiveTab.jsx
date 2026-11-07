import PlayerSearch from "../Components/PlayerSearch";

export default function CS2CompetitiveTab({ onBack }) {
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/1329760.jpeg')`,
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
        style={{ padding: '6px 12px', marginBottom: '15px', cursor: 'pointer' }}
      >
        ← Back to Main CS2 Page
      </button>
      <h2>Competitive CS2 Statistics</h2>
      <PlayerSearch />
      <p>The future database will be put here.</p>
    </div>
  );
}
