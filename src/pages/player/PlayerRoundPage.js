import React, { useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import Deck from '../Deck';

const PlayerRoundPage = ({ gameData, gameRef }) => {
    const { players, teams, gameState, rounds, currentRound } = gameData;
    const currentPlayerIndex = currentRound % players.length;

    const { currentPlayerName } = useContext(CurrentGameContext); // Access context

    const [phrase, setPhrase] = useState(''); // State for the chosen phrase

    const handleChoosePhrase = async (event) => {
        event.preventDefault(); // Prevent form submission

        const updatedRounds = [...rounds];
        updatedRounds[currentRound].phrase = phrase;
        // Update chosen phrase in Firestore based on current player
        await updateDoc(gameRef, {
            rounds: updatedRounds
        });

        // Update game state based on chosen phrase
        // ... (implement your specific logic here)

        // Navigate to the next round or game screen based on game logic
        // ... (implement your specific navigation logic here)
    };

    const chooserName = players[currentPlayerIndex].name;
    const chooser = chooserName === currentPlayerName;
    const chosenPhrase = rounds[currentRound].phrase;

    return (
        <div>
            <h2>Round {currentRound + 1}</h2>
            {chosenPhrase ?
                <div>
                    Phrase: {chosenPhrase}
                    <Deck gameData={gameData} />
                </div> :
                <div>
                    {chooser ? <div>
                        <p>Choose the phrase.</p>
                        <form onSubmit={handleChoosePhrase}>
                            <input
                                type="text"
                                placeholder="Enter your phrase..."
                                value={phrase}
                                onChange={(event) => setPhrase(event.target.value)}
                            />
                            <button type="submit">Choose Phrase</button>
                        </form>
                    </div> :
                        <div>
                            <p>It's {players[currentPlayerIndex].name}'s turn to choose the phrase.</p>
                        </div>}
                </div>}
        </div>

    );
};

export default PlayerRoundPage;