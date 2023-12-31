import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/Firebase';
import HostSetupPage from './HostSetupPage';
import HostRoundPage from './HostRoundPage';
import { getDeck } from '../../utils/utils';

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

  const { deckType, gameState } = gameData;

  return (
    <div className="flex justify-center h-screen">
      {gameState === 'started' ?
        <HostRoundPage deck={getDeck(deckType)} gameData={gameData} gameRef={gameRef} /> :
        <HostSetupPage gameData={gameData} gameRef={gameRef} />}
    </div>

  );
};

export default HostGamePage;
