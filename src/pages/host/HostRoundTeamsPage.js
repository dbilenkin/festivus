import React, { useState, useEffect, useRef, createRef } from 'react';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import HostCard from '../../components/HostCard';
import Nav from '../../components/Nav';
import AnimatedScore from '../../components/AnimatedScore';
import { getCardMatchScore } from '../../utils/utils';

const HostRoundPage = ({ deck, gameData, gameRef, players }) => {
  const { teams, currentRound } = gameData;
  const currentPlayerIndex = currentRound % players.length;

  const chooserName = players[currentPlayerIndex].name;

  const [roundData, setRoundData] = useState(null);
  const [roundRef, setRoundRef] = useState(null);
  const [hydratedTeams, setHydratedTeams] = useState([]);
  const [animationState, setAnimationState] = useState({
    stage: '',
    highlight: [],
    cardIndex: 0,
    teamIndex: 0,
    score: 0,
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 0, y: 0 },
  });

  const teamRefs = useRef([]);

  const setTeamRefs = (element, index) => {
    if (element) {
      teamRefs.current[index] = element;
    }
  };

  const getCardMatch = (card, otherCards) => {
    const { cardIndex } = animationState;
    let match = false;
    let score = 0;
    if (card === otherCards[cardIndex]) {
      match = true;
      score = getCardMatchScore(cardIndex, cardIndex);
    } else if (otherCards.indexOf(card) !== -1) {
      match = true;
      score = getCardMatchScore(cardIndex, otherCards.indexOf(card));
    }
    return { match, score };
  }

  // Start the animation sequence
  useEffect(() => {
    const { stage, cardIndex, teamIndex } = animationState;
    if (stage !== 'highlight' || teamIndex >= hydratedTeams.length) return;

    function highlightMatches() {
      const team = hydratedTeams[teamIndex];
      const card = team.players[0].chosenCards[cardIndex];
      const otherCards = team.players[1].chosenCards;
      const cardMatch = getCardMatch(card, otherCards);
      if (cardMatch.match) {
        setTimeout(() => {
          setAnimationState({
            ...animationState,
            highlight: [card, teamIndex],
            stage: 'adjustScore',
            score: cardMatch.score,
          });
        }, 500);
      } else {
        setAnimationState({
          ...animationState,
          highlight: [],
          stage: 'nextPair',
          score: 0,
        });
      }
    };

    highlightMatches();
  }, [animationState]);

  useEffect(() => {
    const { stage, cardIndex, teamIndex } = animationState;
    if (stage !== 'nextPair') return;
    let newCardIndex = cardIndex + 1;
    let newTeamIndex = teamIndex;
    let nextTeam = false;
    if (cardIndex === 4) {
      newTeamIndex = teamIndex + 1;
      newCardIndex = 0;
      nextTeam = true;
    }

    const newCardState = {
      ...animationState,
      cardIndex: newCardIndex,
      teamIndex: newTeamIndex,
      stage: 'highlight'
    }
    const delayLength = nextTeam ? 500 : 0;
    setTimeout(() => {
      setAnimationState(newCardState);
    }, delayLength);
  }, [animationState])

  // Increment score animation
  useEffect(() => {
    const { stage, cardIndex, teamIndex, score } = animationState;
    if (stage !== 'adjustScore') return;
    function adjustTeamScore() {
      const team = hydratedTeams[teamIndex];
      team.roundScore += score;

      const ref = teamRefs.current[teamIndex];
      const rect = ref.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2 - 45;

      const startPosition = { x, y };
      const endPosition = { x: 0, y };

      setTimeout(() => {
        setAnimationState({ ...animationState, stage: 'animateScore', startPosition, endPosition });
      }, 100);
    };

    adjustTeamScore();
  }, [animationState]);

  useEffect(() => {
    if (hydratedTeams.length > 0 && roundData.flippedCards === 6) {
      setAnimationState({
        ...animationState,
        stage: 'highlight',
      });
    }
  }, [hydratedTeams])

  useEffect(() => {
    const calculateScores = async () => {
      const roundTeams = [...teams];

      for (const team of roundTeams) {
        if (team.players.length === 0) {
          continue;
        }
        const cards1 = team.players[0].chosenCards;
        const cards2 = team.players[1].chosenCards;

        const score = getCardScores(cards1, cards2);
        team.roundScore = score;
        if (team.gameScore) {
          team.gameScore += score;
        } else {
          team.gameScore = score;
        }
      }

      const roundPlayers = [...players];

      for (let i = 0; i < roundPlayers.length; i++) {
        const player = roundPlayers[i];
        player.roundScore = 0;
        player.roundPlayerScores = [];

        for (let j = 0; j < roundPlayers.length; j++) {
          if (i === j) continue;
          const otherPlayer = roundPlayers[j];
          const cards1 = player.chosenCards;
          const cards2 = otherPlayer.chosenCards;
          const roundScore = getCardScores(cards1, cards2);
          player.roundScore += roundScore;
          const roundPlayerScore = {
            name: otherPlayer.name,
            score: roundScore
          }
          player.roundPlayerScores.push(roundPlayerScore);
        }
        player.gameScore += player.roundScore;
      }

      try {
        await updateDoc(roundRef, {
          players: roundPlayers,
          teams: roundTeams,
          scoresCalculated: true
        });
        console.log("Update successful");
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }

    const hydrateTeams = roundData => {
      const _hydratedTeams = [...teams].filter(t => t.players.length === 2);
      for (const team of _hydratedTeams) {
        team.players = players.filter(player => player.team === team.name);
        if (!roundData.teams) {
          team.roundScore = 0;
        }
      }

      let cardCount = 0;
      players.forEach(player => {
        cardCount += player.chosenCards.length;
      });
      setHydratedTeams(_hydratedTeams);
    }

    if (roundData && roundRef) {
      hydrateTeams(roundData);
    }
  }, [roundData, players, roundRef, teams])

  useEffect(() => {
    const roundsRef = collection(gameRef, "rounds");
    const q = query(roundsRef, where('roundNumber', '==', currentRound));

    getDocs(q).then((querySnapshot) => {
      if (querySnapshot.size === 1) {
        const roundId = querySnapshot.docs[0].id;
        const _roundRef = doc(roundsRef, roundId);
        onSnapshot(_roundRef, (doc) => {
          setRoundRef(_roundRef);
          setRoundData(doc.data());
        });
      } else {
        console.error('Invalid short ID.');
      }
    });
  }, [currentRound, gameRef]);

  if (!roundData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getCardPosition = (teamNumber, playerNumber) => {
    if (teamNumber < 2 && playerNumber === 0) {
      return "-31px";
    } else if (teamNumber < 2 && playerNumber === 1) {
      return "-5px";
    } else if (teamNumber >= 2 && playerNumber === 0) {
      return "-10px";
    } else if (teamNumber >= 2 && playerNumber === 1) {
      return "16px";
    }
    return "0px";
  }

  const getPhrase = () => {
    const phrase = roundData.phrase;
    return (
      phrase ? "Phrase: " + phrase :
        <span>Waiting for <span className="text-blue-500">{chooserName}</span> to choose the phrase</span>
    )
  }

  const highlightCard = (cardIndex, currentTeamIndex, playerIndex) => {
    const { highlight } = animationState;
    if (highlight[0] === cardIndex && highlight[1] === currentTeamIndex) {
      return playerIndex === 0 ? "top" : "bottom";
    }
    return false;
  }

  // Function to be called when score animation ends
  const handleScoreAnimationRest = () => {

    setTimeout(() => {
      setAnimationState({ ...animationState, stage: 'nextPair' });
    }, 500);

  };

  return (
    <div>
      <Nav className="max-w-screen-xl" round={currentRound} phrase={getPhrase()} />
      <div className='max-w-screen-xl mx-auto mt-4'>
        <div className="grid grid-cols-2 gap-4">
          {hydratedTeams.map((team, teamI) => (
            <div ref={el => setTeamRefs(el, teamI)} className='flex bg-gray-100 rounded shadow p-3'>
              {(animationState.stage === "animateScore" && animationState.teamIndex === teamI) && (
                <AnimatedScore
                  score={animationState.score}
                  startPosition={animationState.startPosition}
                  endPosition={animationState.endPosition}
                  onRest={handleScoreAnimationRest}
                />
              )}
              <div className="flex flex-col justify-between items-start">
                <div key={team.players[0].name} className="flex items-center mb-2">
                  <div className="text-lg font-semibold w-20 mr-2">{team.players[0].name}</div>
                </div>
                <div className='relative flex-grow-0 my-2'>
                  <h3 className={`font-bold text-xl text-${team.name}-800`}>Team</h3>
                  <h3 className={`font-bold text-xl text-${team.name}-800`}>{team.name}</h3>
                  <p className='text-md'>Round: </p>
                  <p className='text-md'>{team.roundScore}</p>
                  <p className='text-md'>Game:</p>
                  <p className='text-md'>{team.gameScore}</p>
                </div>
                <div className="flex items-center mb-2">
                  <div className="text-lg font-semibold w-20 mr-2">{team.players[1].name}</div>
                </div>
              </div>
              <div key={team.name} className="flex flex-col">
                {team.players.map((player, playerI) => (
                  <div key={player.name} className="flex items-center mb-2">
                    <div className="flex-grow grid grid-cols-5 gap-1">
                      {player.chosenCards.length === 5 ? player.chosenCards.map((cardIndex, i) => (
                        <HostCard
                          deck={deck}
                          cardIndex={cardIndex}
                          flip={roundData.flippedCards > i}
                          position={getCardPosition(teamI, playerI)}
                          backToChosenCards={i + 1 < roundData.flippedCards}
                          highlight={highlightCard(cardIndex, teamI, playerI)} />
                      )) :
                        Array(5).fill().map((_, i) => (
                          <div key={i} className="p-1">
                            <HostCard placeholder={true} />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostRoundPage;