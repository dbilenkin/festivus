import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/Firebase';
import HostSetupPage from './HostSetupPage';
import HostRoundPage from './HostRoundPage';
import HostEndPage from './HostEndPage';
import { getDeck } from '../../utils/utils';
import { Link } from "react-router-dom";

const HostGamePage = () => {
  const [gameData, setGameData] = useState(null);
  const [gameRef, setGameRef] = useState(null);
  const { shortId } = useParams();

  useEffect(() => {
    const gamesRef = collection(db, 'games');
    const q = query(gamesRef, where('shortId', '==', shortId));

    getDocs(q).then((querySnapshot) => {
      if (querySnapshot.size === 1) {
        const gameId = querySnapshot.docs[0].id;
        const _gameRef = doc(db, 'games', gameId);
        setGameRef(_gameRef);
        onSnapshot(_gameRef, (doc) => {
          setGameData(doc.data());
        });
      } else {
        console.error('Invalid short ID.');
      }
    });
  }, [shortId]);

  if (!gameData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayHostPage = () => {
    const { deckType, gameState } = gameData;

    if (gameState === "setup") {
      return <HostSetupPage gameData={gameData} gameRef={gameRef} />
    }
    if (gameState === 'started') {
      return <HostRoundPage deck={getDeck(deckType)} gameData={gameData} gameRef={gameRef} />
    }
    if (gameState === "ended") {
      return <HostEndPage deck={getDeck(deckType)} gameData={gameData} gameRef={gameRef} />
    }

    return <div>Something went wrong</div>
  }

  return (
    <div>
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to={`/`}><h1 className="text-xl font-bold">Incommon</h1></Link>
        </div>
      </nav>
      {displayHostPage()}
    </div>

  );
};

export default HostGamePage;
