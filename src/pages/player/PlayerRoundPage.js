import React, { useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import Deck from '../../components/Deck';
import Button from '../../components/Button';
import { getOrdinal } from '../../utils/utils';

const PlayerRoundPage = ({ gameData, gameRef, players, deck }) => {
  const { currentRound, gameLength } = gameData;
  const currentPlayerIndex = currentRound % players.length;

  const { currentPlayerName, currentPlayerId } = useContext(CurrentGameContext);
  const firstPlayer = players[0].name === currentPlayerName;

  const [phrase, setPhrase] = useState('');
  const [roundData, setRoundData] = useState('');
  const [roundRef, setRoundRef] = useState(null);
  const [cardsSubmitted, setCardsSubmitted] = useState(false);
  const [flippedCards, setFlippedCards] = useState(0);
  const totalCards = 5;

  useEffect(() => {
    console.log({ currentPlayerId })
  }, [currentPlayerId])

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
  }, [currentRound, gameRef]);

  useEffect(() => {
    const currPlayer = players.find(player => player.name === currentPlayerName);
    setCardsSubmitted(currPlayer.chosenCards && currPlayer.chosenCards.length > 0);
  }, [players, currentPlayerName]);

  const handleChoosePhrase = async (event) => {
    event.preventDefault();
    await updateDoc(roundRef, {
      phrase
    });
  };

  const handleSelectCards = async (assignedBoxes) => {
    const chosenCards = Object.values(assignedBoxes).slice(0, 5);

    try {
      const currentPlayerDocRef = doc(gameRef, 'players', currentPlayerId);
      await updateDoc(currentPlayerDocRef, {
        chosenCards: chosenCards
      });

      setCardsSubmitted(true);
    } catch (error) {
      console.error("Error updating player's chosenCards: ", error);
    }
  };

  const clearChosenCards = async () => {

    const playersRef = collection(gameRef, 'players');
    const q = query(playersRef);

    try {
      const querySnapshot = await getDocs(q);
      const playerDocs = querySnapshot.docs;

      for (const playerDoc of playerDocs) {
        const playerDocRef = playerDoc.ref;
        await updateDoc(playerDocRef, {
          chosenCards: []
        });
      }
    } catch (error) {
      console.error("Error clearing chosen cards: ", error);
    }
  };

  const handleFlipCard = async () => {
    if (flippedCards <= totalCards) {
      const newFlippedCards = flippedCards + 1;
      setFlippedCards(newFlippedCards);
      await updateDoc(roundRef, { flippedCards: newFlippedCards });
    }
  };

  const startNextRound = async () => {
    clearChosenCards();
    setFlippedCards(0);
    setPhrase("");
    const updatedPlayers = [...players];
    for (let i = 0; i < roundData.players.length; i++) {
      updatedPlayers[i].gameScore = roundData.players[i].gameScore;
      updatedPlayers[i].connections = roundData.players[i].connections;
    }

    try {
      if (currentRound === gameLength) {
        await updateDoc(gameRef, {
          gameState: "ended"
        });
      } else {
        const roundsRef = collection(gameRef, "rounds")
        await addDoc(roundsRef, {
          roundNumber: currentRound + 1,
          phrase: '',
          players: updatedPlayers,
        });

        await updateDoc(gameRef, {
          currentRound: currentRound + 1,
        });
      }

    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }

  const showFirstPlayerChoices = () => {
    let message = "Start Next Round";
    if (!roundData.allCardsSubmitted) {
      return (
        <p className="mx-4 text-xl font-semibold text-gray-300 bg-gray-800 px-4 py-2 rounded-lg shadow mt-4">
          Waiting for all players <br></br> to submit cards...
        </p >
      )
    }
    if (flippedCards < totalCards) {
      message = `Flip ${getOrdinal(flippedCards + 1)} Card`;
    } else if (flippedCards === totalCards) {
      message = 'Show Scores';
    } else if (currentRound === gameLength) {
      message = "Show End Screen";
    }

    return (
      <div className='m-4'>
        {flippedCards <= totalCards ? (
          <Button className="w-full" onClick={handleFlipCard}>
            {message}
          </Button>
        ) : (
          <Button className="w-full" onClick={startNextRound}>
            {message}
          </Button>
        )}
      </div>
    );
  };

  const showWaitingForNextRound = () => {
    return (
      <p className="mx-4 text-lg font-semibold text-gray-300 bg-gray-800 px-4 py-2 rounded-lg shadow mt-4">
        Waiting for next round to start...
      </p >
    )
  }

  const showDeck = () => {
    return (
      <div className='max-w-screen-sm bg-gray-800'>
        <div className="deckContainer mb-4 mx-auto bg-gray-800">
          <p className="flex justify-between items-center font-semibold text-gray-300 bg-gray-800 border-b border-gray-500 px-2 py-1">
            <span className='text-md'>Round {currentRound}</span>
            <span className='text-lg font-bold text-gray-100'>{roundData.phrase}</span>
          </p>
          <Deck deck={deck} gameData={gameData} handleSelectCards={handleSelectCards} />
        </div>
      </div>
    )
  }

  const showChoosePhrase = () => {
    return (
      <div className='bg-gray-800 mx-4 text-gray-300 text-lg p-4 mt-4 rounded-lg'>
        <form onSubmit={handleChoosePhrase} className="space-y-4">
          <p className="text-lg font-semibold">Choose the phrase for round {currentRound}</p>
          <input
            type="text"
            placeholder="Enter your phrase..."
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
            className="mr-2 px-3 py-2 bg-gray-700 border border-gray-500 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button className="w-full" type="submit">Choose Phrase</Button>
        </form>

      </div>
    )
  }

  const showWaitingForPhrase = () => {
    return (
      <div className='m-4 text-gray-300 bg-gray-800 rounded-lg shadow'>
        <p className="text-2xl font-semibold  px-4 py-2">
          Waiting for <span className="text-green-500 font-bold">{players[currentPlayerIndex].name}</span> <br></br>to choose the phrase
        </p>
      </div>
    )
  }

  const displayRoundPage = () => {
    const chooserName = players[currentPlayerIndex].name;
    const chooser = chooserName === currentPlayerName;

    if (roundData.phrase) {
      if (cardsSubmitted) {
        if (firstPlayer) {
          return showFirstPlayerChoices();
        }
        return showWaitingForNextRound();
      }
      return showDeck();
    }

    if (chooser) {
      return showChoosePhrase();
    }
    return showWaitingForPhrase();
  }

  return (
    <div className="max-w-screen-sm mx-auto text-center">
      {displayRoundPage()}
    </div>
  );
};

export default PlayerRoundPage;