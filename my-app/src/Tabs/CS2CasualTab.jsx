import PlayerSearch from "../Components/PlayerSearch";

export default function CS2CasualTab({ onBack }) {
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
        ← Back to CS2 Main
      </button>
      <h2>Casual CS2 Statistics</h2>
      <PlayerSearch />
      <p>Database player stats for Casual mode will go here.</p>
    </div>
  );
}