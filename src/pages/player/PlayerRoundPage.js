import React, { useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import Deck from '../../components/Deck';
import { Link } from "react-router-dom";
import { TouchBackend } from 'react-dnd-touch-backend'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

const PlayerRoundPage = ({ gameData, gameRef }) => {
    const { players, teams, gameState, currentRound } = gameData;
    const currentPlayerIndex = currentRound % players.length;

    const { currentPlayerName } = useContext(CurrentGameContext); // Access context
    const firstPlayer = players[0].name === currentPlayerName;

    const [phrase, setPhrase] = useState(''); // State for the chosen phrase
    const [roundData, setRoundData] = useState('');
    const [roundRef, setRoundRef] = useState(null);
    const [cardsSubmitted, setCardsSubmitted] = useState(false);

    useEffect(() => {
        const roundsRef = collection(gameRef, "rounds");
        const q = query(roundsRef, where('roundNumber', '==', currentRound));

        getDocs(q).then((querySnapshot) => {
            if (querySnapshot.size === 1) {
                const roundId = querySnapshot.docs[0].id;
                const _roundRef = doc(roundsRef, roundId);
                onSnapshot(_roundRef, (doc) => {
                    setRoundRef(_roundRef);
                    setRoundData(doc.data());

                });
            } else {
                console.error('Invalid short ID.');
            }
        });
    }, [currentRound]);

    useEffect(() => {
        if (roundData) {
            const currPlayer = roundData.players.find(player => player.name === currentPlayerName);
            setCardsSubmitted(currPlayer.chosenCards && currPlayer.chosenCards.length > 0);
        }
    }, [roundData]);

    const handleChoosePhrase = async (event) => {
        event.preventDefault();

        // Update chosen phrase in Firestore based on current player
        await updateDoc(roundRef, {
            phrase
        });
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
            setCardsSubmitted(true);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const startNextRound = async () => {
        try {
            const roundsRef = collection(gameRef, "rounds")
            await addDoc(roundsRef, {
                roundNumber: currentRound + 1,
                phrase: '',
                players
            });

            await updateDoc(gameRef, {
                currentRound: currentRound + 1
            });
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }

    const showContinueToNextRound = () => {
        return (
            firstPlayer ?
                <div className=''>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                        onClick={startNextRound}>
                        Start Next Round
                    </button>
                </div>
                :
                <div className='mb-4 text-lg'>
                    Waiting for other players...
                </div>
        )
    }

    const showDeck = () => {
        return (
            cardsSubmitted ?
                showContinueToNextRound()
                : <div className="mb-4">
                    <DndProvider backend={HTML5Backend}>
                        <Deck gameData={gameData} handleSelectCards={handleSelectCards} />
                    </DndProvider>
                </div >
        )
    }

    const showChooser = () => {
        const chooserName = players[currentPlayerIndex].name;
        const chooser = chooserName === currentPlayerName;

        return (
            chooser ? <div>
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
                </div>
        )
    }

    return (
        <div>
            <nav className="bg-gray-800 text-white shadow-lg">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to={`/`}><h1 className="text-xl font-bold">Incommon</h1></Link>
                    <div className="mr-6">
                        <p className="text-md">Round {currentRound}</p>
                    </div>
                    <div>
                        <p className="text-md">{currentPlayerName}</p>
                    </div>
                </div>
            </nav>
            <div className="container mx-auto text-center">
                <div className='text-md my-2'>
                    Phrase: {roundData.phrase}
                </div>
                {roundData.phrase ? showDeck() : showChooser()}
            </div>
        </div>
    );
};

export default PlayerRoundPage;