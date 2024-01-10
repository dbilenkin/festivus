import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Spinner from '../../components/Spinner';
import Nav from '../../components/Nav';

function HostEndPage({ gameData, gameRef }) {

  const [round, setRound] = useState(null);

  useEffect(() => {

    async function fetchRoundData() {
      const roundsRef = collection(gameRef, 'rounds');
      const q = query(roundsRef, where('roundNumber', '==', gameData.gameLength));

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const roundData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setRound(roundData[0]);
        } else {
          console.log("No matching rounds found");
        }
      } catch (error) {
        console.error("Error fetching round data: ", error);
      }
    }

    fetchRoundData();

  }, [gameData.gameLength, gameRef]);

  if (!gameData || !round) {
    return (
      <Spinner />
    );
  }

  const sortedTeams = [...round.teams].sort((a, b) => b.gameScore - a.gameScore);
  const sortedPlayers = [...round.players].sort((a, b) => b.gameScore - a.gameScore);

  return (
    <div>
      <Nav className="container" />
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



        {/* Players Incommon */}
        <div className="mt-4 bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Players In Common</h2>
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
                        .join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostEndPage;
