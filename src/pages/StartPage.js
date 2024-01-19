import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/Firebase';
import { generateShortId } from '../utils/utils';
import { CurrentGameContext } from '../contexts/CurrentGameContext';
import Button from '../components/Button';
import Nav from '../components/Nav';

function StartPage() {
  const { setCurrentPlayerName, setCurrentPlayerId, setGameRef } = useContext(CurrentGameContext);

  useEffect(() => {
    const storedPlayerName = localStorage.getItem('currentPlayerName');
    if (storedPlayerName) {
      setCurrentPlayerName(storedPlayerName);
    }
  }, [setCurrentPlayerName]);

  const [playerName, setPlayerName] = useState('');
  const [shortId, setShortId] = useState('');
  const navigate = useNavigate();

  const teams = [
    { name: "red", players: [], roundScore: 0, gameScore: 0 },
    { name: "green", players: [], roundScore: 0, gameScore: 0 },
    { name: "blue", players: [], sroundScore: 0, gameScore: 0 },
    { name: "orange", players: [], roundScore: 0, gameScore: 0 },
  ];
  const newGameJson = {
    teams, gameState: 'setup'
  }

  const handleSetShortId = value => {
    setShortId(value.toUpperCase());
  }

  const handleCreateGame = async () => {
    const gameRef = await addDoc(collection(db, 'games'), newGameJson);
    setGameRef(gameRef);
    const gameId = gameRef.id;
    const shortId = generateShortId(gameId);

    await updateDoc(gameRef, {
      shortId: shortId
    });

    navigate(`/host/${shortId}`);
  };

  const handleJoinGame = async () => {
    if (!playerName || !shortId) {
      alert('Please enter your name and game ID.');
      return;
    }

    setCurrentPlayerName(playerName);

    const gamesRef = collection(db, 'games');
    const q = query(gamesRef, where('shortId', '==', shortId));

    await getDocs(q).then((querySnapshot) => {
      if (querySnapshot.size === 1) {
        const gameId = querySnapshot.docs[0].id;
        const gameRef = doc(db, 'games', gameId);
        setGameRef(gameRef);

        const playersRef = collection(gameRef, "players")
        addDoc(playersRef, {
          name: playerName,
          gameScore: 0,
          roundScore: 0,
          chosenCards: [],
          connections: {},
          team: '',
          joinedAt: serverTimestamp()
        }).then(player => {
          setCurrentPlayerId(player.id);
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
    <div className="mx-auto">
      <Nav className="max-w-screen-md"/>
      <div className='max-w-screen-md mx-auto p-4'>
        <div className="mb-6">
          <p className="text-2xl font-bold mb-4 text-gray-800">
            Create a Game
          </p>
          <Button onClick={handleCreateGame}>
            Create Game
          </Button>
        </div>
        <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></hr>
        <p className="text-2xl font-bold mb-4 text-gray-800">
          Join a Game
        </p>
        <div className='flex'>
          <div className="mb-4 w-64">
            <label htmlFor="playerName" className="block text-gray-700 text-sm font-bold mb-2">Your Name:</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="ml-4 mb-4 w-24">
            <label htmlFor="shortId" className="block text-gray-700 text-sm font-bold mb-2">Game ID:</label>
            <input
              type="text"
              id="shortId"
              value={shortId}
              onChange={e => handleSetShortId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

        </div>
        <Button onClick={handleJoinGame}>
          Join Game
        </Button>
      </div>
    </div>

  );
}

export default StartPage;
