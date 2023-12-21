import React, { useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';

const HostRoundPage = ({ gameData, gameRef }) => {
    const { players, teams, gameState, currentRound } = gameData;
    const currentPlayerIndex = currentRound % players.length;

    const chooserName = players[currentPlayerIndex].name;

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

    if (!roundData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const phrase = roundData.phrase;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Round {currentRound}</h2>
            {phrase ?
                <div className="text-lg text-center mb-4">Phrase: {phrase}</div> :
                <div className="text-lg text-center mb-4">
                    <p>{chooserName} is choosing the phrase...</p>
                </div>
            }

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(team => (
                    <div key={team.name} className="bg-gray-100 p-4 rounded shadow">
                        <h3 className="font-semibold text-lg mb-3">{team.name} - Score: {/* Team score here */}</h3>
                        {team.players.map(player => (
                            <div key={player.name} className="mb-4">
                                <span className="font-semibold">{player.name}</span>
                                <div className="mt-2 grid grid-cols-5 gap-2">
                                    {/* Placeholder for the 5 chosen cards */}
                                    {Array(5).fill().map((_, i) => (
                                        <div key={i} className="h-20 bg-gray-300 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>



    );
};

export default HostRoundPage;