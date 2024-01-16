import React, { useState, useContext } from 'react';
import { collection } from 'firebase/firestore';
import { doc, updateDoc, addDoc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import Button from '../../components/Button';
import { db } from '../../utils/Firebase';
import Spinner from '../../components/Spinner';
import { getIndexDeck } from '../../utils/utils';

const PlayerSetupPage = ({ gameData, gameRef, players }) => {
  const { currentPlayerName, currentPlayerId } = useContext(CurrentGameContext); // Access context

  const [chosenTeam, setChosenTeam] = useState('');
  const [joinedTeam, setJoinedTeam] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState('original');
  const [selectedGameLength, setSelectedGameLength] = useState('3');

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

  const { teams } = gameData;
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
    <div className="max-w-screen-md mx-auto p-4 text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Joined Players:</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-gray-800  text-left text-sm uppercase font-normal">Player Name</th>
              {/* <th className="px-5 py-3 border-b-2 border-gray-200 text-gray-800  text-left text-sm uppercase font-normal">Team</th> */}
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              player.name !== currentPlayerName ?
                <tr key={player.name} className="hover:bg-gray-100">
                  <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{player.name}</td>
                  {/* <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{player.team}</td> */}
                </tr> :
                (
                  <tr key={player.name} className="hover:bg-gray-100">
                    <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{currentPlayerName}</td>
                    {false && <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                      {!joinedTeam ?
                        <div className="flex items-center">
                          <select
                            value={chosenTeam}
                            onChange={handleSelectTeam}
                            className="appearance-none mr-2 py-2 px-4 border rounded shadow"
                          >
                            <option value="">Choose Team</option>
                            {teams.map((team) => (
                              <option key={team.name} value={team.name}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                          <Button
                            onClick={handleJoinTeam}
                            disabled={!chosenTeam}
                            className={`${chosenTeam ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-200'}`}>
                            Join
                          </Button>
                        </div> :
                        <span>{chosenTeam}</span>
                      }
                    </td>}
                  </tr>
                )
            ))}
          </tbody>

        </table>
      </div>

      {firstPlayer &&
        <div>
          <div className="mt-4">
            <label htmlFor="deckType" className="block text-gray-700 text-sm font-bold mb-2">
              Choose your deck:
            </label>
            <select
              id="deckType"
              value={selectedDeck}
              onChange={handleDeckChange}
              className="block appearance-none w-full border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              <option key="1" value="original">Original</option>
              <option key="2" value="movieStars">Movie Stars</option>
              <option key="3" value="actors">Actors</option>
              <option key="4" value="actresses">Actresses</option>
              <option key="5" value="actorsAndActresses">Actors & Actresses</option>
            </select>
          </div>
          <div className="mt-4">
            <label htmlFor="deckType" className="block text-gray-700 text-sm font-bold mb-2">
              Game Length:
            </label>
            <select
              id="deckType"
              value={selectedGameLength}
              onChange={handleGameLengthChange}
              className="block appearance-none w-full border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              <option key="3" value="3">Short</option>
              <option key="5" value="5">Medium</option>
              <option key="10" value="10">Long</option>
            </select>
          </div>
          <Button onClick={handleStartGame} className={"mt-4"}>
            Start Game
          </Button>
        </div>
      }
    </div>
  );
};

export default PlayerSetupPage;
