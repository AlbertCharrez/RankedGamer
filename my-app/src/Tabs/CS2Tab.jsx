import PlayerSearch from "../Components/PlayerSearch";

export default function CS2Tab() {
  return (
    <div
        style={{
          backgroundImage: `Linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/CS2Tab.png)`,
          backgroundSize: `cover`,
          backgroundPosition: `center`,
          minHeight: '85vh',
          padding: '30px',
          borderRadius: '12px', 
          color: 'white',
        }}
        >

        <h2> CS2 </h2>
        <PlayerSearch />
        <p> Welcome to the CS2 tab!</p>
    </div>
  );
}
