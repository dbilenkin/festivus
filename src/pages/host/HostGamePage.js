import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/Firebase';
import HostSetupPage from './HostSetupPage';
import HostRoundPage from './HostRoundPage';

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
    return <p>Loading...</p>;
  }

  const { players, gameState } = gameData;

  return (
    <div>
      {gameState === 'started' ?
        <HostRoundPage gameData={gameData} gameRef={gameRef} /> :
        <HostSetupPage gameData={gameData} gameRef={gameRef} />}
    </div>

  );
};

export default HostGamePage;
