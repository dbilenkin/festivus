import React, { useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { CurrentGameContext } from '../../contexts/CurrentGameContext';

const HostRoundPage = ({ gameData, gameRef }) => {
    const { players, teams, gameState, rounds, currentRound } = gameData;
    const currentPlayerIndex = currentRound % players.length;

    const chooserName = players[currentPlayerIndex].name;
    const phrase = rounds[currentRound].phrase;

    return (
        <div>
            <h2>Round {currentRound + 1}</h2>
            {phrase ?
                <div>
                    Phrase: {phrase}
                </div> :
                <div>
                    <p>{chooserName} is choosing the phrase...</p>
                </div>}
        </div>

    );
};

export default HostRoundPage;