import React, { useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import Deck from '../Deck';

const PlayerRoundPage = ({ gameData, gameRef }) => {
    const { players, teams, gameState, currentRound } = gameData;
    const currentPlayerIndex = currentRound % players.length;

    const { currentPlayerName } = useContext(CurrentGameContext); // Access context

    const [phrase, setPhrase] = useState(''); // State for the chosen phrase
    const [roundData, setRoundData] = useState('');
    const [roundRef, setRoundRef] = useState(null);

    useEffect(() => {

        const roundsRef = collection(gameRef, "rounds");
        const q = query(roundsRef, where('roundNumber', '==', currentRound));

        getDocs(q).then((querySnapshot) => {
            if (querySnapshot.size === 1) {
                const roundId = querySnapshot.docs[0].id;
                const _roundRef = doc(roundsRef, roundId);
                onSnapshot(_roundRef, (doc) => {
                    setRoundRef(_roundRef);
                    console.log(doc.data());
                    setRoundData(doc.data());

                });
            } else {
                console.error('Invalid short ID.');
            }
        });


    }, []);

    const handleChoosePhrase = async (event) => {
        event.preventDefault(); // Prevent form submission

        // Update chosen phrase in Firestore based on current player
        await updateDoc(roundRef, {
            phrase
        });

        // Update game state based on chosen phrase
        // ... (implement your specific logic here)

        // Navigate to the next round or game screen based on game logic
        // ... (implement your specific navigation logic here)
    };

    const handleSelectCards = async (assignedBoxes) => {
        const chosenCards = Object.values(assignedBoxes); // Adjust this according to your logic
        const roundPlayers = [...roundData.players];
        const player = roundPlayers.find(p => p.name === currentPlayerName);
        player.chosenCards = chosenCards;

        try {
            await updateDoc(roundRef, {
                players: roundPlayers
            });
            console.log("Update successful");
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const chooserName = players[currentPlayerIndex].name;
    const chooser = chooserName === currentPlayerName;
    const chosenPhrase = roundData.phrase;

    return (
        <div className="container mx-auto text-center">
            <nav className="bg-gray-800 text-white shadow-lg">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Incommon</h1>
                    <div className="flex items-center">
                        <div className="mr-6">
                            <h2 className="text-lg">Round {currentRound + 1}</h2>
                        </div>
                        <div>
                            <p className="text-md">Phrase: {chosenPhrase}</p>
                        </div>
                    </div>
                </div>
            </nav>


            {chosenPhrase ?
                <div className="mb-4">
                    <Deck gameData={gameData} handleSelectCards={handleSelectCards} />
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