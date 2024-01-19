import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import Spinner from '../../components/Spinner';
import ConnectionThresholdRangeInput from '../../components/ConnectionThresholdRangeInput';

function PlayerEndPage({ gameData, gameRef }) {

  const [round, setRound] = useState(null);
  const [roundRef, setRoundRef] = useState(null);

  useEffect(() => {

    async function fetchRoundData() {
      const roundsRef = collection(gameRef, 'rounds');
      const q = query(roundsRef, where('roundNumber', '==', gameData.gameLength));

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const roundId = querySnapshot.docs[0].id;
          const _roundRef = doc(roundsRef, roundId);
          setRoundRef(_roundRef);
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

  const { currentPlayerName } = useContext(CurrentGameContext);

  if (!gameData || !round) {
    return (
      <Spinner />
    );
  }

  // const sortedTeams = [...round.teams].sort((a, b) => b.gameScore - a.gameScore);
  const sortedPlayers = [...round.players].sort((a, b) => b.gameScore - a.gameScore);

  // const team = sortedTeams.find(team => team.players.findIndex(p => p.name === currentPlayerName) !== -1);
  const player = sortedPlayers.find(p => p.name === currentPlayerName);

  // const teamRank = sortedTeams.findIndex(t => t.name === team.name) + 1;
  const playerRank = sortedPlayers.findIndex(p => p.name === currentPlayerName) + 1;

  return (
    <div className="container mx-auto p-4">
      Update Connection Threshold:
      <ConnectionThresholdRangeInput roundRef={roundRef} />
      {/* Team Placement */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Team Placement</h2>
        <p>Your team, <span className={`text-${team.name}-700 font-bold`}>{team.name}</span>, finished in <span className="font-semibold">{teamRank} place</span>.</p>
      </div> */}

      {/* Individual Placement */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Individual Placement</h2>
        <p>You finished in <span className="font-semibold">{playerRank} place</span>.</p>
      </div> */}

      {/* Match List */}
      {/* <div>
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
      </div> */}
    </div>
  );
}

export default PlayerEndPage;
