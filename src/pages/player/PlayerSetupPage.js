import React, { useState, useContext, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { doc, updateDoc, addDoc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import Button from '../../components/Button';
import { db } from '../../utils/Firebase';
import Spinner from '../../components/Spinner';
import { getIndexDeck, displayFormattedDeckType, displayGameLength } from '../../utils/utils';

const PlayerSetupPage = ({ gameData, gameRef, players }) => {
  const { currentPlayerName, currentPlayerId } = useContext(CurrentGameContext); // Access context

  const [chosenTeam, setChosenTeam] = useState('');
  const [joinedTeam, setJoinedTeam] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(gameData.deckType || 'original');
  const [selectedGameLength, setSelectedGameLength] = useState(gameData.gameLength || 3);

  useEffect(() => {
    const updateGame = async () => {
      await updateDoc(gameRef, {
        gameLength: parseInt(selectedGameLength),
        deckType: selectedDeck,
      });
    }

    updateGame();
  }, [selectedGameLength, selectedDeck])


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

  const { teams, shortId } = gameData;
  const firstPlayer = players[0].name === currentPlayerName;

  const handleSelectTeam = (event) => {
    setChosenTeam(event.target.value);
  };

  const handleJoinTeam = async () => {
    if (!chosenTeam) {
      alert("Please choose a team.");
      return;
    }

    const updatedTeams = [...gameData.teams];
    const teamIndex = updatedTeams.findIndex((team) => team.name === chosenTeam);
    updatedTeams[teamIndex].players.push(currentPlayerName);

    const playerDocRef = doc(db, 'games', gameRef.id, 'players', currentPlayerId);
    await updateDoc(playerDocRef, {
      team: chosenTeam
    });

    await updateDoc(gameRef, {
      teams: updatedTeams
    });

    setJoinedTeam(true);
  };

  const handleStartGame = async () => {

    const indexDeck = getIndexDeck(selectedDeck);

    const roundsRef = collection(gameRef, "rounds")
    await addDoc(roundsRef, {
      roundNumber: 1,
      phrase: '',
      players
    });

    await updateDoc(gameRef, {
      gameLength: parseInt(selectedGameLength),
      currentRound: 1,
      deckType: selectedDeck,
      indexDeck,
      gameState: 'started',
    });
  };

  return (
    <div className="max-w-screen-sm mx-auto p-4 text-lg text-gray-200">
      <h2 className="bg-gray-800 text-gray-200 text-xl font-bold mb-4 p-4 text-gray-100 rounded-lg">Game ID: {shortId}</h2>
      <div className="overflow-x-auto bg-gray-800 rounded-lg">
        <table className="min-w-full leading-normal text-gray-300">
          <thead>
            <tr className="">
              <th className="px-4 py-3 border-b-2 border-gray-700 text-gray-300 text-left uppercase font-bold">Joined Players</th>
              {/* <th className="px-5 py-3 border-b-2 border-gray-200 text-gray-800  text-left text-sm uppercase font-normal">Team</th> */}
            </tr>
          </thead>
          <tbody>
            <tr className="">
              <td className="px-4 py-2 border-b border-gray-700 bg-gray-800 text-gray-300">
                {players.map(p => p.name).join(", ")}
              </td>
              {/* <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{player.team}</td> */}
            </tr>
          </tbody>

        </table>
      </div>

      <div className='text-gray-300'>
        {firstPlayer ? <div className="mt-4 p-4 bg-gray-800 rounded-lg flex items-center">
          <label htmlFor="deckType" className="block font-bold mb-2 w-2/5">
            Select Deck
          </label>
          <select
            id="deckType"
            value={selectedDeck}
            onChange={handleDeckChange}
            className="block appearance-none w-3/5 bg-gray-700 border border-gray-500 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-gray-500"
          >
            <option key="1" value="original">Original</option>
            <option key="2" value="celebrities">Celebrities</option>
            <option key="3" value="actors">Actors</option>
            <option key="4" value="famousPeople">Famous People</option>
            <option key="5" value="animals">Animals</option>
          </select>
        </div> :
          <div className='mt-4 p-4 bg-gray-800 rounded-lg'>
            <label htmlFor="deckType" className="block font-normal">
              Deck: <span className='font-bold'>{displayFormattedDeckType(gameData.deckType)}</span>
            </label>
          </div>}
        {firstPlayer ? <div className="mt-4 p-4 bg-gray-800 rounded-lg flex items-center">
          <label htmlFor="deckType" className="block font-bold mb-2 w-2/5">
            Select Game Length
          </label>
          <select
            id="deckType"
            value={selectedGameLength}
            onChange={handleGameLengthChange}
            className="block appearance-none w-3/5 bg-gray-700 border border-gray-500 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-gray-500"
          >
            <option key="3" value="3">Short</option>
            <option key="5" value="5">Medium</option>
            <option key="10" value="10">Long</option>
          </select>
        </div> :
          <div className='mt-4 p-4 bg-gray-800 rounded-lg'>
            <label htmlFor="deckType" className="block font-normal">
              Game Length: <span className='font-bold'>{displayGameLength(gameData.gameLength)}</span>
            </label>
          </div>}
        {firstPlayer && <Button onClick={handleStartGame} className={"mt-4 w-full text-xl p-4"}>
          Start Game
        </Button>}
      </div>
    </div>
  );
};

export default PlayerSetupPage;
