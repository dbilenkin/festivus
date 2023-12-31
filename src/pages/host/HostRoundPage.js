import React, { useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';
import HostCard from '../../components/HostCard';
// import data from '../data.json';
import cardback from '../../components/card-back.jpg';
import { Link } from "react-router-dom";
import { cards } from '../../utils/utils';

// const cards = data.filter((_, i) => i < 52).map(element => element.imageUrl);

const HostRoundPage = ({ deck, gameData, gameRef }) => {
    const { players, teams, gameState, currentRound } = gameData;
    const currentPlayerIndex = currentRound % players.length;

    const chooserName = players[currentPlayerIndex].name;

    const [roundData, setRoundData] = useState(null);
    const [roundRef, setRoundRef] = useState(null);
    const [flipCards, setFlipCards] = useState(false);
    const [hydratedTeams, setHydratedTeams] = useState([]);
    const [scoresCalculated, setScoresCalculated] = useState(false);

    const getCardScores = (cards1, cards2) => {
        let score = 0;

        for (let i = 0; i < cards1.length; i++) {
            if (cards1[i] === cards2[i]) {
                score += 3;
            } else if (cards1.indexOf(cards2[i]) !== -1) {
                score += 2;
            }
        }

        return score;
    }

    const calculateScores = async () => {
        const roundTeams = [...teams];
        const gameTeams = [...teams];

        for (const team of roundTeams) {
            if (team.players.length === 0) {
                continue;
            }
            const cards1 = team.players[0].chosenCards;
            const cards2 = team.players[1].chosenCards;

            const score = getCardScores(cards1, cards2);
            team.roundScore = score;

            const gameTeam = gameTeams.find(t => t.name === team.name);
            const newGameScore = gameTeam.gameScore + score;
            team.gameScore = newGameScore;
            gameTeam.gameScore = newGameScore;
        }

        const roundPlayers = [...roundData.players];
        const gamePlayers = [...players];

        for (let i = 0; i < roundPlayers.length; i++) {
            const player = roundPlayers[i];
            player.roundScore = 0;
            for (let j = 0; j < roundPlayers.length; j++) {
                if (i === j) continue;
                const otherPlayer = roundPlayers[j];
                const cards1 = player.chosenCards;
                const cards2 = otherPlayer.chosenCards;
                const roundScore = getCardScores(cards1, cards2);
                player.roundScore += roundScore;
            }
            const gamePlayer = gamePlayers.find(p => p.name === player.name);
            const gamePlayerScore = gamePlayer.gameScore ? gamePlayer.gameScore : 0;
            const newGamePlayerScore = gamePlayerScore + player.roundScore;
            gamePlayer.gameScore = newGamePlayerScore;
            player.gameScore = newGamePlayerScore;
        }

        setScoresCalculated(true);
        try {
            await updateDoc(roundRef, {
                players: roundPlayers,
                teams: roundTeams,
                scoresCalculated: true
            });

            await updateDoc(gameRef, {
                players: gamePlayers,
                teams: gameTeams
            });
            console.log("Update successful");
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }

    const hydrateTeams = roundData => {
        const _hydratedTeams = [...teams];
        for (const team of _hydratedTeams) {
            team.players = roundData.players.filter(player => player.team === team.name);
            if (!roundData.teams) {
                team.roundScore = 0;
            }
        }

        let cardCount = 0;
        roundData.players.forEach(player => {
            cardCount += player.chosenCards.length;
        });
        setHydratedTeams(_hydratedTeams);

        if (!roundData.teams) {
            if (cardCount / 5 === players.length) {
                setFlipCards(true);
                calculateScores();
            }
        } else {
            setFlipCards(true);
        }
    }

    useEffect(() => {
        if (roundData && roundRef) {
            hydrateTeams(roundData);
        }
    }, [roundData])

    useEffect(() => {
        setFlipCards(false);
        setScoresCalculated(false);
        const roundsRef = collection(gameRef, "rounds");
        const q = query(roundsRef, where('roundNumber', '==', currentRound));

        getDocs(q).then((querySnapshot) => {
            if (querySnapshot.size === 1) {
                const roundId = querySnapshot.docs[0].id;
                const _roundRef = doc(roundsRef, roundId);
                onSnapshot(_roundRef, (doc) => {
                    setRoundRef(_roundRef);
                    // console.log(doc.data());
                    setRoundData(doc.data());
                });
            } else {
                console.error('Invalid short ID.');
            }
        });
    }, [currentRound]);

    if (!roundData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const phrase = roundData.phrase;

    return (
        <div>
            <nav className="bg-gray-800 text-white shadow-lg">
                <div className="mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to={`/`}><h1 className="text-xl font-bold">Incommon</h1></Link>
                    <div>
                        <p className="text-md">Phrase: {phrase}</p>
                    </div>
                    <div className="mr-6">
                        <p className="text-md">Round {currentRound}</p>
                    </div>
                </div>
            </nav>
            <div className="mx-auto">
                {!phrase &&
                    <div className='mb-4 flex justify-center items-center'>
                        <p className="text-lg font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg shadow">
                            Waiting for <span className="text-blue-500">{chooserName}</span> to choose the phrase
                        </p>
                    </div>
                }

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {hydratedTeams.map(team => (
                        team.players.length === 2 && <div 
                            key={team.name} 
                            className={`bg-${team.name}-800 text-white px-4 pt-2 rounded shadow`}>
                            <div className='flex justify-between'>
                                <h3 className="font-semibold text-lg">Team {team.name}</h3>
                                <h3>Round Score: {team.roundScore}</h3>
                                <h3>Game Score: {team.gameScore}</h3>
                            </div>
                            {team.players.map(player => (
                                <div key={player.name} className="mb-4">
                                    <div className="mt-2 grid grid-cols-6 gap-2">
                                        <div className="font-semibold text-lg">
                                            <div>{player.name}</div>
                                            <div className='text-xs mt-2'>Round Score</div>
                                            <div className='font-bold'>{player.roundScore}</div>
                                            <div className='text-xs mt-2'>Game Score</div>
                                            <div>{player.gameScore}</div>
                                        </div>
                                        {player.chosenCards.length === 5 && player.chosenCards.map(cardIndex => (
                                            <div key={cardIndex}>
                                                <HostCard deck={deck} cardIndex={cardIndex} flipped={flipCards} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>



    );
};

export default HostRoundPage;