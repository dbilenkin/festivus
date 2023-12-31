import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '../utils/Firebase';
import { generateShortId } from '../utils/utils';
import { CurrentGameContext } from '../contexts/CurrentGameContext';
import Button from '../components/Button';

function StartPage() {
    const { setCurrentPlayerName, setGameRef } = useContext(CurrentGameContext);

    useEffect(() => {
        const storedPlayerName = localStorage.getItem('currentPlayerName');
        if (storedPlayerName) {
            setCurrentPlayerName(storedPlayerName);
        }
    }, []);

    const [playerName, setPlayerName] = useState('');
    const [shortId, setShortId] = useState('');
    const navigate = useNavigate();

    const teams = [
        { name: "red", players: [], score: 0 },
        { name: "green", players: [], score: 0 },
        { name: "blue", players: [], score: 0 }
    ];
    const newGameJson = {
        players: [], teams, category: '', phrase: '', scores: {}
    }

    const handleStartGame = async () => {
        const gameRef = await addDoc(collection(db, 'games'), newGameJson);
        setGameRef(gameRef);
        const gameId = gameRef.id;
        const shortId = generateShortId(gameId); // Generate short ID

        await updateDoc(gameRef, {
            shortId: shortId, // Add short ID to game document
        });

        navigate(`/host/${shortId}`);
    };

    const handleJoinGame = async () => {
        if (!playerName || !shortId) {
            alert('Please enter your name and game ID.');
            return;
        }

        setCurrentPlayerName(playerName);

        // Updated to query by short ID
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, where('shortId', '==', shortId));

        await getDocs(q).then((querySnapshot) => {
            if (querySnapshot.size === 1) {
                const gameId = querySnapshot.docs[0].id;
                const updatedPlayers = querySnapshot.docs[0].data().players;
                updatedPlayers.push({
                    name: playerName,
                    score: 0,
                    chosenCards: [],
                    team: ''
                });

                const gameRef = doc(db, 'games', gameId);
                setGameRef(gameRef);
                updateDoc(gameRef, {
                    players: updatedPlayers
                }).then(() => {
                    navigate(`/player/${shortId}`);
                }).catch((error) => {
                    console.error(error);
                });
            } else {
                alert('Invalid game ID.');
            }
        });
    };


    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Start a Game or Join</h2>

            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Host a Game</h3>
                <Button onClick={handleStartGame}>
                    Start Game
                </Button>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-2">Join a Game</h3>
                <div className="mb-4">
                    <label htmlFor="playerName" className="block text-gray-700 text-sm font-bold mb-2">Your Name:</label>
                    <input
                        type="text"
                        id="playerName"
                        value={playerName}
                        onChange={e => setPlayerName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="shortId" className="block text-gray-700 text-sm font-bold mb-2">Game ID:</label>
                    <input
                        type="text"
                        id="shortId"
                        value={shortId}
                        onChange={e => setShortId(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <Button onClick={handleJoinGame}>
                    Join Game
                </Button>
            </div>
        </div>

    );
}

export default StartPage;
