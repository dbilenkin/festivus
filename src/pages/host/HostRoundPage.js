import React, { useState, useEffect, useRef, createRef } from 'react';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import HostCard from '../../components/HostCard';
import Nav from '../../components/Nav';
import AnimatedScore from '../../components/AnimatedScore';
import { getCardMatchScore } from '../../utils/utils';
import AnimatedPlayerScore from '../../components/AnimatePlayerScore';
import { getCardScores } from '../../utils/utils';

const HostRoundPage = ({ gameData, gameRef, players, deck }) => {
  const { currentRound } = gameData;
  const currentPlayerIndex = currentRound % players.length;

  const chooserName = players[currentPlayerIndex].name;

  const [roundData, setRoundData] = useState(null);
  const [roundRef, setRoundRef] = useState(null);
  const [animateScores, setAnimateScores] = useState(false);
  const [animationState, setAnimationState] = useState({
    stage: '',
    highlightedCard: null,
    cardIndex: 0,
    playerIndex: 0,
    score: 0,
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 0, y: 0 },
  });

  const getCardMatch = (card) => {
    const { cardIndex, playerIndex } = animationState;
    let match = false;
    let score = 0;
    for (let i = 0; i < players.length; i++) {
      if (i === playerIndex) continue;
      const otherCards = players[i].chosenCards;
      if (card === otherCards[cardIndex]) {
        match = true;
        score += getCardMatchScore(cardIndex, cardIndex);
      } else if (otherCards.indexOf(card) !== -1) {
        match = true;
        score += getCardMatchScore(cardIndex, otherCards.indexOf(card));
      }
    }

    const roundPlayer = roundData.players[playerIndex];
    roundPlayer.roundScore += score;

    return { match, score };
  }

  useEffect(() => {
    const roundsRef = collection(gameRef, "rounds");
    const q = query(roundsRef, where('roundNumber', '==', currentRound));

    getDocs(q).then((querySnapshot) => {
      if (querySnapshot.size === 1) {
        const roundId = querySnapshot.docs[0].id;
        const _roundRef = doc(roundsRef, roundId);
        onSnapshot(_roundRef, (doc) => {
          setRoundRef(_roundRef);
          // const _roundData = doc.data();
          // if (_roundData)
          setRoundData(doc.data());
        });
      } else {
        console.error('Invalid short ID.');
      }
    });
  }, [currentRound, gameRef]);

  useEffect(() => {
    const { stage, cardIndex, playerIndex } = animationState;
    if (stage !== 'highlight' || playerIndex >= players.length) return;

    function highlightMatches() {
      const player = players[playerIndex];
      const card = player.chosenCards[cardIndex];
      const cardMatch = getCardMatch(card);
      if (cardMatch.match) {
        setTimeout(() => {
          setAnimationState({
            ...animationState,
            highlightedCard: card,
            stage: 'adjustScore',
            score: cardMatch.score,
          });
        }, 500);
      } else {
        setAnimationState({
          ...animationState,
          highlightedCard: null,
          stage: 'nextCard',
          score: 0,
        });
      }
    };

    highlightMatches();
  }, [animationState]);

  useEffect(() => {
    const { stage, cardIndex, playerIndex, score } = animationState;
    if (stage !== 'adjustScore') return;
    function adjustScore() {

      setTimeout(() => {
        setAnimationState({ ...animationState, stage: 'animateScore' });
      }, 100);
    };

    adjustScore();
  }, [animationState]);

  useEffect(() => {
    const { stage, cardIndex, playerIndex } = animationState;
    if (stage !== 'nextCard') return;
    let newCardIndex = cardIndex + 1;
    let newPlayerIndex = playerIndex;
    let nextPlayer = false;
    if (cardIndex === 4) {
      newPlayerIndex = playerIndex + 1;
      newCardIndex = 0;
      nextPlayer = true;
    }

    const newCardState = {
      ...animationState,
      cardIndex: newCardIndex,
      playerIndex: newPlayerIndex,
      stage: 'highlight'
    }
    const delayLength = nextPlayer ? 500 : 0;
    setTimeout(() => {
      setAnimationState(newCardState);
    }, delayLength);
  }, [animationState])



  useEffect(() => {
    if (roundData && roundData.flippedCards === 6) {

      const calculateScores = async () => {
        const roundPlayers = [...players];
        let connectionScores = [];

        for (let i = 0; i < roundPlayers.length; i++) {
          const player = roundPlayers[i];
          player.roundScore = 0;

          const roundPlayer = roundData.players.find(p => p.name === player.name);
          player.gameScore = roundPlayer.gameScore;
          player.connections = roundPlayer.connections;

          for (let j = 0; j < roundPlayers.length; j++) {
            if (i === j) continue;
            const otherPlayer = roundPlayers[j];
            const cards1 = player.chosenCards;
            const cards2 = otherPlayer.chosenCards;
            const roundScore = getCardScores(cards1, cards2);
            player.roundScore += roundScore;

            if (!player.connections || !player.connections[otherPlayer.name]) {
              player.connections[otherPlayer.name] = roundScore;
            } else {
              player.connections[otherPlayer.name] += roundScore;
            }

            connectionScores.push(player.connections[otherPlayer.name]);
          }
          player.gameScore += player.roundScore;
        }
        connectionScores.sort((a, b) => a - b);
        const connectionThreshold = connectionScores[Math.floor(connectionScores.length / 2)];
        try {
          await updateDoc(roundRef, {
            players: roundPlayers,
            scoresCalculated: true,
            connectionScores,
            connectionThreshold
          });
          console.log("Update successful");
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      }

      if (!roundData.scoresCalculated) {
        calculateScores();
      }
      // setAnimationState({
      //   ...animationState,
      //   stage: 'highlight',
      // });
    }
  }, [roundData])

  useEffect(() => {
    const checkAllCardsSubmitted = async () => {
      let allCardsSubmitted = true;
      for (let player of players) {
        if (player.chosenCards.length < 5) {
          allCardsSubmitted = false;
          break;
        }
      }
      if (allCardsSubmitted) {
        try {
          await updateDoc(roundRef, {
            allCardsSubmitted: true
          });
          console.log("Update successful");
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      }
    }

    checkAllCardsSubmitted();

  }, [players]);

  // Function to be called when score animation ends
  const handleScoreAnimationRest = () => {
    // setTimeout(() => {
    //   setAnimationState({ ...animationState, stage: 'nextCard' });
    // }, 500);
  };

  if (!roundData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getWord = () => {
    const word = roundData.word;
    return (
      word ? <span>Word:  <span className='text-green-500 font-bold uppercase'>{word}</span></span> :
        <span>Waiting for <span className="text-green-500 font-bold">{chooserName}</span> to choose the word</span>
    )
  }

  const getCardPosition = (playerNumber) => {
    const row = Math.floor(playerNumber / 2);
    const y = row * 10 - 40;
    return y + 'px';
  }

  const highlightPlayer = playerIndex => {
    // return playerIndex === animationState.playerIndex && roundData.flippedCards === 6;
    return false;
  }

  return (
    <div>
      <Nav className={`${players.length <= 4 ? 'max-w-2xl' : 'max-w-screen-xl'}`} round={currentRound} word={getWord()} />
      <div className='max-w-screen-xl mx-auto mt-2'>
        <div className={`grid ${players.length <= 4 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          {players.map((player, playerIndex) => (
            <div key={playerIndex}
              className={`flex bg-gray-800 text-gray-200 rounded-lg shadow px-3 pt-2 ${players.length <= 4 ? 'mx-auto' : ''}`}
              style={{
                boxShadow: highlightPlayer(playerIndex) ? '0 0 20px 10px gold' : '',
                width: players.length <= 4 ? '55%' : 'auto', // Adjust width for fewer players
              }}>
              <div className="flex flex-col justify-between items-start">
                <div className="flex flex-col items-center mb-2">
                  <div className="text-lg font-semibold w-20 mr-2 pb-2 text-center">{player.name}</div>
                  <div className="text-sm w-20 mr-2 border-t-2 border-gray-100 pt-2 text-center">Round</div>
                  <div className="relative text-md font-semibold w-20 mr-2 pb-2 flex justify-center">
                    {(roundData.scoresCalculated) ? (
                      <AnimatedPlayerScore
                        score={roundData.players[playerIndex].roundScore}
                        onRest={handleScoreAnimationRest}
                      />
                    ) :
                      <div className='absolute text-base text-center'>{roundData.players[playerIndex].roundScore}</div>}
                  </div>
                  <div className={`text-sm ${players.length <= 4 ? 'w-28' : 'w-20'} mr-2 border-t-2 border-gray-100 pt-2 mt-5 text-center`}>Game</div>
                  <div className="relative text-md font-semibold w-20 mr-2 pb-2 flex justify-center">
                    {(roundData.scoresCalculated) ? (
                      <AnimatedPlayerScore
                        score={roundData.players[playerIndex].gameScore}
                        onRest={handleScoreAnimationRest}
                      />
                    ) :
                      <div className='absolute text-base text-center'>{roundData.players[playerIndex].gameScore}</div>}
                  </div>                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <div className="flex-grow grid grid-cols-5 gap-1">
                    {player.chosenCards.length === 5 ? player.chosenCards.map((cardIndex, i) => (
                      <div key={cardIndex} className="p-1">
                        <HostCard
                          deck={deck}
                          cardIndex={cardIndex}
                          flip={roundData.flippedCards > i}
                          position={getCardPosition(playerIndex)}
                          backToChosenCards={i + 1 < roundData.flippedCards}
                          highlight={cardIndex === animationState.highlightedCard}
                        />
                      </div>
                    )) :
                      Array(5).fill().map((_, i) => (
                        <div key={i} className="p-1">
                          <HostCard placeholder={true} />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
};

export default HostRoundPage;