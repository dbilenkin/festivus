import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { doc, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import Button from '../../components/Button';
// import data from '../data.json';

// const cards = data.filter((_, i) => i < 52).map(element => element.imageUrl);

const PlayerSetupPage = ({ gameData, gameRef }) => {
    const { currentPlayerName, setCards } = useContext(CurrentGameContext); // Access context

    const [chosenTeam, setChosenTeam] = useState(null);
    const [joinedTeam, setJoinedTeam] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState('original');

    const handleDeckChange = (event) => {
        setSelectedDeck(event.target.value);
    };

    const { players, teams } = gameData;
    const firstPlayer = players[0].name === currentPlayerName;

    const handleSelectTeam = (event) => {
        setChosenTeam(event.target.value);
    };

    const handleJoinTeam = async () => {
        if (!chosenTeam) {
            alert("Please choose a team.");
            return;
        }

        // Find the index of the chosen team
        const teamIndex = gameData.teams.findIndex((team) => team.name === chosenTeam);

        // Update the chosen team's player IDs
        const updatedTeams = [...gameData.teams];
        updatedTeams[teamIndex].players.push(currentPlayerName);

        const updatedPlayers = [...gameData.players];
        const playerIndex = updatedPlayers.findIndex(player => player.name === currentPlayerName);
        updatedPlayers[[playerIndex]].team = chosenTeam;

        console.log(gameRef);

        await updateDoc(gameRef, {
            teams: updatedTeams,
            players: updatedPlayers
        });

        setJoinedTeam(true);
    };

    const handleStartGame = async () => {

        const roundsRef = collection(gameRef, "rounds")
        await addDoc(roundsRef, {
            roundNumber: 1,
            phrase: '',
            players
        });

        // Update game state in Firestore
        await updateDoc(gameRef, {
            currentRound: 1,
            deckType: selectedDeck,
            gameState: 'started', // Set game state to started
        });
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Joined Players:</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-gray-800  text-left text-sm uppercase font-normal">Player Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-gray-800  text-left text-sm uppercase font-normal">Team</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player) => (
                            player.name !== currentPlayerName ?
                                <tr key={player.name} className="hover:bg-gray-100">
                                    <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{player.name}</td>
                                    <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{player.team}</td>
                                </tr> :
                                (
                                    <tr className="hover:bg-gray-100">
                                        <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{currentPlayerName}</td>
                                        <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                                            {!joinedTeam ?
                                                <div className="flex items-center">
                                                    <select
                                                        value={chosenTeam}
                                                        onChange={handleSelectTeam}
                                                        className="mr-2 py-2 px-4 border rounded shadow"
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
                                        </td>
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
                            <option value="original">Original</option>
                            <option value="actors">Actors</option>
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
