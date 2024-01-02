import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/Firebase';
import { Link } from "react-router-dom";
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import PlayerRoundPage from './PlayerRoundPage';
import PlayerSetupPage from './PlayerSetupPage';
import PlayerEndPage from './PlayerEndPage';
import { getDeck } from '../../utils/utils';

const PlayerGamePage = () => {

    const { shortId } = useParams();
    const [gameData, setGameData] = useState(null);
    const { gameRef, setGameRef } = useContext(CurrentGameContext);

    const { currentPlayerName } = useContext(CurrentGameContext); // Access context

    useEffect(() => {
        if (gameRef) {
            onSnapshot(gameRef, (doc) => {
                console.log(doc.data());
                setGameData(doc.data());

            });
        } else {
            const gamesRef = collection(db, 'games');
            const q = query(gamesRef, where('shortId', '==', shortId));

            getDocs(q).then((querySnapshot) => {
                if (querySnapshot.size === 1) {
                    const gameId = querySnapshot.docs[0].id;
                    const _gameRef = doc(db, 'games', gameId);
                    setGameRef(_gameRef)
                    onSnapshot(_gameRef, (doc) => {
                        // console.log(doc.data());
                        setGameData(doc.data());

                    });
                } else {
                    console.error('Invalid short ID.');
                }
            });
        }


    }, [shortId]);

    if (!gameData) {
        return <p>Loading...</p>;
    }

    const displayPlayerPage = () => {
        const { deckType, gameState } = gameData;
        if (gameState === "setup") {
            return <PlayerSetupPage gameData={gameData} gameRef={gameRef} />
        }
        if (gameState === 'started') {
            return <PlayerRoundPage deck={getDeck(deckType)} gameData={gameData} gameRef={gameRef} />
        }
        if (gameState === "ended") {
            return <PlayerEndPage deck={getDeck(deckType)} gameData={gameData} gameRef={gameRef} />
        }
        return <div>Something went wrong</div>
    }

    return (
        <div>
            <nav className="bg-gray-800 text-white shadow-lg">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to={`/`}><h1 className="text-xl font-bold">Incommon</h1></Link>
                    <div>
                        <p className="text-md">{currentPlayerName}</p>
                    </div>
                </div>
            </nav>
            {displayPlayerPage()}
        </div>
    );
};

export default PlayerGamePage;
