import React, { useState, useContext, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { doc, updateDoc, addDoc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import Button from '../../components/Button';
import { db } from '../../utils/Firebase';
import Spinner from '../../components/Spinner';
import { getIndexDeck, displayFormattedDeckType, displayGameLength, displayWordSelection } from '../../utils';

const PlayerSetupPage = ({ gameData, gameRef, players }) => {
  const { currentPlayerName, currentPlayerId } = useContext(CurrentGameContext);
  const [selectedDeck, setSelectedDeck] = useState(gameData.deckType || 'life');
  const [selectedGameLength, setSelectedGameLength] = useState(gameData.gameLength || 3);
  const [selectedWordSelection, setSelectedWordSelection] = useState(gameData.wordSelection || 'wordList');

  useEffect(() => {
    const updateGame = async () => {
      await updateDoc(gameRef, {
        gameLength: parseInt(selectedGameLength),
        deckType: selectedDeck,
        wordSelection: selectedWordSelection,
      });
    }

    updateGame();
  }, [selectedGameLength, selectedDeck, selectedWordSelection])

  const handleWordSelectionChange = (event) => {
    setSelectedWordSelection(event.target.value);
  }

  const handleDeckChange = (event) => {
    setSelectedDeck(event.target.value);
  };

  const handleGameLengthChange = (event) => {
    setSelectedGameLength(event.target.value);
  };

  if (!players.length) {
    return (
      <Spinner />
    );
  }

  const { shortId } = gameData;
  const firstPlayer = players[0].name === currentPlayerName;

  const handleStartGame = async () => {

    const indexDeck = getIndexDeck(selectedDeck);

    const roundsRef = collection(gameRef, "rounds")
    await addDoc(roundsRef, {
      roundNumber: 1,
      word: '',
      players
    });

    await updateDoc(gameRef, {
      gameLength: parseInt(selectedGameLength),
      currentRound: 1,
      deckType: selectedDeck,
      indexDeck,
      gameState: 'started',
      numCards: players.length <= 8 ? 5 : 4
    });
  };

  return (
    <div className="max-w-screen-sm mx-auto p-4 text-lg text-gray-300">
      <h2 className="bg-gray-800 text-gray-300 text-xl font-bold mb-4 p-4 text-gray-300 rounded-lg">Game Code: {shortId}</h2>
      <div className='mt-4 p-4 bg-gray-800 rounded-lg'>
        <div className="pb-2 border-b-2 border-gray-700 text-left text-lg">
          Joined Players
        </div>
        <div className="pt-2 text-lg font-bold">
          {players.map(p => p.name).join(", ")}
        </div>
      </div>

      <div className='text-gray-300 mt-4 p-4 bg-gray-800 rounded-lg'>
        {firstPlayer ? <div className="flex items-center pb-4 border-b-2 border-gray-700">
          <label htmlFor="deckType" className="block font-bold w-5/12">
            Deck
          </label>
          <select
            id="deckType"
            value={selectedDeck}
            onChange={handleDeckChange}
            className="block appearance-none w-7/12 bg-gray-700 border border-gray-500 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-gray-500"
          >
            <option value="life">Life</option>
            <option value="celebrities">Celebrities</option>
            <option value="actors">Actors</option>
            <option value="famousPeople">Famous People</option>
            <option value="animals">Animals</option>
          </select>
        </div> :
          <div className=''>
            <label htmlFor="deckType" className="block pb-2 font-normal border-b-2 border-gray-700">
              Deck: <span className='font-bold'>{displayFormattedDeckType(gameData.deckType)}</span>
            </label>
          </div>}
        {firstPlayer ? <div className="flex items-center py-4 border-b-2 border-gray-700">
          <label htmlFor="deckType" className="block font-bold w-5/12">
            Game Length
          </label>
          <select
            id="deckType"
            value={selectedGameLength}
            onChange={handleGameLengthChange}
            className="block appearance-none w-7/12 bg-gray-700 border border-gray-500 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-gray-500"
          >
            <option key="3" value="3">Short</option>
            <option key="5" value="5">Medium</option>
            <option key="10" value="10">Long</option>
          </select>
        </div> :
          <div className=''>
            <label htmlFor="deckType" className="block py-2 font-normal border-b-2 border-gray-700">
              Game Length: <span className='font-bold'>{displayGameLength(gameData.gameLength)}</span>
            </label>
          </div>}
        {firstPlayer ? <div className="flex items-center pt-4">
          <label htmlFor="deckType" className="block font-bold w-5/12">
            Word Choice
          </label>
          <select
            id="deckType"
            value={selectedWordSelection}
            onChange={handleWordSelectionChange}
            className="block appearance-none w-7/12 bg-gray-700 border border-gray-500 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-gray-500"
          >
            <option value="wordList">Word List</option>
            <option value="custom">Custom</option>
          </select>
        </div> :
          <div className=''>
            <label htmlFor="deckType" className="block pt-2 font-normal">
              Word Choice: <span className='font-bold'>{displayWordSelection(gameData.wordSelection)}</span>
            </label>
          </div>}
      </div>
      {firstPlayer && <Button onClick={handleStartGame} className={"mt-4 w-full text-xl p-4"}>
        Start Game
      </Button>}
    </div>
  );
};

export default PlayerSetupPage;
