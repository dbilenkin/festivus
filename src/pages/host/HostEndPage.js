import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Spinner from '../../components/Spinner';
import Nav from '../../components/Nav';
import PlayerGraph from '../../components/PlayerGraph';
import PlayerConnectionsTable from '../../components/PlayerConnectionsTable';
import { getCardScores } from '../../utils/utils';

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

  const sortedPlayers = [...round.players].sort((a, b) => b.roundScore - a.roundScore);
  // const data = {
  //   nodes: [
  //     { id: "Player 1", group: 1 },
  //     { id: "Player 2", group: 1 },
  //     { id: "Player 3", group: 1 },
  //     // Add more players as needed
  //   ],
  //   links: [
  //     { source: "Player 1", target: "Player 2", value: 10 },
  //     { source: "Player 1", target: "Player 3", value: 5 },
  //     { source: "Player 2", target: "Player 3", value: 1 },
  //     // Add more links as needed, where 'value' represents the connection strength
  //   ]
  // };

  ////////////// TESTING

  // round.players = round.players.slice(0, 8);

  // const generateChosenCards = () => {
  //   for (let i = 0; i < round.players.length; i++) {
  //     const chosenCards = [];
  //     for (let j = 0; j < 5; j++) {
  //       let randomIndexFound = false;
  //       while (!randomIndexFound) {
  //         const randomTry = Math.floor(Math.random() * 26)
  //         if (!chosenCards.includes(randomTry)) {
  //           chosenCards.push(randomTry);
  //           randomIndexFound = true;
  //         }
  //       }
  //       round.players[i].chosenCards = chosenCards;
  //     }
  //   }
  // }

  // generateChosenCards();

  // const calculateScores = async () => {
  //   const roundPlayers = round.players;

  //   for (let i = 0; i < roundPlayers.length; i++) {
  //     const player = roundPlayers[i];
  //     player.roundScore = 0;
  //     player.gameScore = 0;
  //     player.connections = [];

  //     for (let j = 0; j < roundPlayers.length; j++) {
  //       if (i === j) continue;
  //       const otherPlayer = roundPlayers[j];
  //       const cards1 = player.chosenCards;
  //       const cards2 = otherPlayer.chosenCards;
  //       const roundScore = getCardScores(cards1, cards2);
  //       player.roundScore += roundScore;
  //       const connection = {
  //         name: otherPlayer.name,
  //         score: roundScore
  //       }
  //       player.connections.push(connection);
  //     }
  //     player.gameScore += player.roundScore;
  //   }
  // }

  // calculateScores();
  // console.log(round.players);

  ///////////////// END TESTING ///////////

  const data = { nodes: [], links: [] };
  let maxScore = 0;
  let totalScore = 0;
  let averageScore = 0;
  let strongestPair = {};

  const getMaxScore = () => {
    for (let i = 0; i < round.players.length; i++) {
      const player = round.players[i];
      for (let j = 0; j < player.connections.length; j++) {
        const otherPlayer = player.connections[j];
        const score = otherPlayer.score;
        totalScore += score;
        if (score > maxScore) {
          maxScore = score;
          strongestPair = {
            source: player.name,
            target: otherPlayer.name,
            value: score
          }
        }
      }
    }
  }

  getMaxScore();

  const getAverageScore = () => {
    averageScore = totalScore / (round.players.length * (round.players.length - 1))
  }

  getAverageScore();

  let groups = {};

  const addToGroups = (neighborGroupNumber, player) => {
    if (!Object.hasOwn(groups, player.name)) {
      groups[player.name] = neighborGroupNumber;
      for (let i = 0; i < player.connections.length; i++) {
        const connection = player.connections[i];
        const otherPlayer = round.players.find(p => p.name === connection.name);
        if (connection.score > averageScore) {
          addToGroups(neighborGroupNumber, otherPlayer)
        }
      }
    }
  }

  const createGroups = () => {
    let groupNumber = 0;
    addToGroups(groupNumber, round.players[0]);
    for (let i = 1; i < round.players.length; i++) {
      const player = round.players[i];
      if (!Object.hasOwn(groups, player.name)) {
        groupNumber++;
        addToGroups(groupNumber, player);
      }
    }
    for (let [key, value] of Object.entries(groups)) {
      data.nodes.push({
        id: key,
        group: value
      })
    }
  }

  createGroups();

  const createDataFromPlayerScores = () => {
    for (let i = 0; i < round.players.length; i++) {
      const player = round.players[i];
      for (let j = i + 1; j < round.players.length; j++) {
        const connection = player.connections.find(c => c.name === round.players[j].name);
        const score = connection.score;
        if (score > averageScore) {
          data.links.push({
            source: player.name,
            target: connection.name,
            value: score,
          });
        }
      }
    }
  }

  createDataFromPlayerScores();

  const strongestPlayer = [...round.players].sort((a, b) => b.gameScore - a.gameScore)[0];
  const strongestConnectionCount = strongestPlayer.connections.filter(({score}) => score > averageScore).length;

  return (
    <div>
      <Nav className="container" />
      <div className='max-w-screen-xl mx-auto mt-3'>
        {/* Summary Section */}
        <div className='text-center mb-4 p-4 bg-gray-700 text-gray-100 rounded-lg'>
          <h2 className='text-3xl font-bold mb-4'>Game Summary</h2>
          <p className='text-xl'>
            <span className='font-bold'>{strongestPlayer.name}</span> had the most in common with the group with {strongestConnectionCount} connections totaling {strongestPlayer.gameScore} points!
          </p>
          <p className='text-xl'>
            <span className='font-bold'>{strongestPair.source}</span> & <span className='font-bold'>{strongestPair.target}</span> had the most in common with each other with a score of {maxScore} points!
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Player Connections Table */}
          <div className='md:col-span-1 rounded-lg'>
            <PlayerConnectionsTable
              playersData={round.players}
              averageScore={averageScore}
              strongestPlayer={strongestPlayer.name}
              strongestPair={strongestPair} />
          </div>
          {/* Player Graph */}
          <div className='md:col-span-1 bg-gray-100 border border-2 border-gray-800 rounded-lg'>
            <PlayerGraph data={data} strongestPlayer={strongestPlayer.name} strongestPair={strongestPair} />
          </div>
        </div>
      </div>
    </div>

  );

}

export default HostEndPage;
