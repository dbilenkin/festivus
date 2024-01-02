import React from 'react';

function HostEndPage({ gameData }) {
    const { teams, players } = gameData;
    // Sort teams and players by score (assuming teams and players have a 'score' property)
    const sortedTeams = [...teams].sort((a, b) => b.gameScore - a.gameScore);
    const sortedPlayers = [...players].sort((a, b) => b.gameScore - a.gameScore);

    const getPlayerScores = (player, matchPlayer) => {
        const otherPlayer = player.gamePlayerScores.find(p => p.name === matchPlayer.name);
        return (
            <div>{matchPlayer.name}: {otherPlayer.score}</div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Teams in Rank Order */}
            <div className="flex flex-wrap -mx-2">
                {/* Team Rankings */}
                <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                    <div className="p-4 bg-gray-800 rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-4 text-white">Team Rankings</h2>
                        <div className="bg-gray-700 p-3 rounded">
                            {sortedTeams.map(team => (
                                <div key={team.name} className="mb-2 text-white">
                                    {team.name}: {team.gameScore}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Individual Player Scores */}
                <div className="w-full md:w-1/2 px-2">
                    <div className="p-4 bg-gray-800 rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-4 text-white">Player Scores</h2>
                        <div className="bg-gray-700 p-3 rounded">
                            {sortedPlayers.map(player => (
                                <div key={player.name} className="mb-2 text-white">
                                    {player.name}: {player.gameScore}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>



            {/* Match Grid */}
            <div className="mt-4 bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 text-center text-white">Player Scores</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-white">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="px-4 py-2 text-left font-semibold">Player</th>
                                <th className="px-4 py-2 text-left font-semibold">Other Players</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-600">
                            {sortedPlayers.map((player) => (
                                <tr key={player.name} className="border-b border-gray-200">
                                    <td className="px-4 py-2">{player.name}</td>
                                    <td className="px-4 py-2">
                                        {player.gamePlayerScores
                                            .sort((a, b) => b.score - a.score)
                                            .map((score) => `${score.name}: ${score.score}`)
                                            .join(', ')} {/* Join the scores into a single string */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
}

export default HostEndPage;
