import {useState} from 'react';
import SearchBubble from '../Components/SearchBubble.jsx';

function GamePage() {
    return (
        <div> 
            <h2> General Game Page </h2>
            <p> This is the gneral page which should lead to unique games in the future but currently leads to this!</p>
            <div style={{marginTop: '25px'}}>
        {activeTab === 'gamePage' && <GamePage />}
      </div>
        <SearchBubble />
        <searchBubble onSearch={(q) => console.log("Searching for", q)} />
      </div>
    );
}

export default GamePage;