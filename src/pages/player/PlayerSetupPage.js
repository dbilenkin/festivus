import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/Firebase';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';

const PlayerSetupPage = ({ gameData, gameRef }) => {
    const { currentPlayerName } = useContext(CurrentGameContext); // Access context

    const [chosenTeam, setChosenTeam] = useState(null);
    const [joinedTeam, setJoinedTeam] = useState(false);

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

        // Update game state in Firestore
        await updateDoc(gameRef, {
            rounds: [
                {
                    phrase: ''
                }
            ],
            currentRound: 0,
            gameState: 'started', // Set game state to started
        });
    };

    return (
        <div>
            <h2>Joined Players:</h2>
            <table>
                <thead>
                    <tr>
                        <th>Player Name</th>
                        <th>Team</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player) => (
                        player.name !== currentPlayerName ?
                            <tr key={player.name}>
                                <td>{player.name}</td>
                                <td>{player.team}</td>
                            </tr> :
                            (
                                <tr>
                                    <td>{currentPlayerName}</td>
                                    {!joinedTeam ?
                                        <td>
                                            <select value={chosenTeam} onChange={handleSelectTeam}>
                                                <option value="">Choose Team</option>
                                                {teams.map((team) => (
                                                    <option key={team.name} value={team.name}>
                                                        {team.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td> :
                                        <td>{chosenTeam}</td>}
                                    <td>
                                        {(chosenTeam && !joinedTeam) && <button onClick={handleJoinTeam}>Join Team</button>}
                                    </td>
                                </tr>
                            )
                    ))}
                    {firstPlayer && <button onClick={handleStartGame}>Start Game</button>}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerSetupPage;
