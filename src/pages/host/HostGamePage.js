import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../utils/Firebase';
import HostSetupPage from './HostSetupPage';
import HostRoundPage from './HostRoundPage';
import HostEndPage from './HostEndPage';
import { getDeck } from '../../utils/utils';
import Spinner from '../../components/Spinner';

const HostGamePage = () => {
  const [gameData, setGameData] = useState(null);
  const [gameRef, setGameRef] = useState(null);
  const [players, setPlayers] = useState([]);
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

  useEffect(() => {
    if (gameRef) {
      const playersRef = collection(gameRef, 'players');
      const q = query(playersRef, orderBy('joinedAt', 'asc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const playersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPlayers(playersData);
      });

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    }
  }, [gameRef]);


  if (!gameData) {
    return (
      <Spinner />
    );
  }

  const displayHostPage = () => {
    const { deckType, gameState } = gameData;

    if (gameState === "setup") {
      return <HostSetupPage gameData={gameData} gameRef={gameRef} players={players} />
    }
    if (gameState === 'started') {
      return <HostRoundPage deck={getDeck(deckType)} gameData={gameData} gameRef={gameRef} players={players} />
    }
    if (gameState === "ended") {
      return <HostEndPage deck={getDeck(deckType)} gameData={gameData} gameRef={gameRef} players={players} />
    }

    return <div>Something went wrong</div>
  }

  return (
    <div>
      {displayHostPage()}
    </div>

  );
};

export default HostGamePage;
