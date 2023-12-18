import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '../utils/Firebase';
import { generateShortId } from '../utils/utils';
import { CurrentGameContext } from '../contexts/CurrentGameContext';

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
        players: [], teams, category: '', phrase: '', chosenCards: {}, scores: {}
    }

    const handleStartGame = async () => {
        const gameRef = await addDoc(collection(db, 'games'), newGameJson);
        // setGameRef(gameRef);
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
                    chosenCards: {},
                    team: ''
                });

                const gameRef = doc(db, 'games', gameId);
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
        <div>
            <h2>Start a Game or Join</h2>

            <h3>Host a Game</h3>
            <button onClick={handleStartGame}>Start Game</button>
            <br />

            <h3>Join a Game</h3>
            <label htmlFor="playerName">Your Name:</label>
            <input type="text" id="playerName" value={playerName} onChange={e => setPlayerName(e.target.value)} />
            <br />

            <label htmlFor="shortId">Game ID:</label>
            <input type="text" id="shortId" value={shortId} onChange={e => setShortId(e.target.value)} />
            <br />
            <button onClick={handleJoinGame}>Join Game</button>
        </div>
    );
}

export default StartPage;
