import React, { useContext } from 'react';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';

function PlayerEndPage({ gameData }) {

    const { currentPlayerName } = useContext(CurrentGameContext);

    const { teams, players } = gameData;
    const sortedTeams = [...teams].sort((a, b) => b.gameScore - a.gameScore);
    const sortedPlayers = [...players].sort((a, b) => b.gameScore - a.gameScore);

    const team = teams.find(team => team.players.findIndex(p => p.name === currentPlayerName) !== -1);
    const player = players.find(p => p.name === currentPlayerName);

    const teamRank = sortedTeams.findIndex(t => t.name === team.name) + 1;
    const playerRank = sortedPlayers.findIndex(p => p.name === currentPlayerName) + 1;

    return (
        <div className="container mx-auto p-4">
            {/* Team Placement */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Team Placement</h2>
                <p>Your team, <span className={`text-${team.name}-700 font-bold`}>{team.name}</span>, finished in <span className="font-semibold">{teamRank} place</span>.</p>
            </div>

            {/* Individual Placement */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Individual Placement</h2>
                <p>You finished in <span className="font-semibold">{playerRank} place</span>.</p>
            </div>

            {/* Match List */}
            <div>
                <h2 className="text-xl font-bold mb-2">Incommon with Others</h2>
                <ul>
                    {player.gamePlayerScores
                        .sort((a, b) => b.score - a.score)
                        .map((otherPlayer, index) => (
                        <li key={otherPlayer.name} className="mb-1">
                            {index + 1}. {otherPlayer.name} - Score: {otherPlayer.score}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default PlayerEndPage;
