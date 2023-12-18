
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/Firebase';

const HostSetupPage = ({gameData}) => {

    const { players, shortId } = gameData;

    return (
        <div>
            <h2>Game ID: {shortId}</h2>
            <h2>Joined Players:</h2>
            <ul>
                {players.map(player => (
                    <li key={player.name}>{player.name} {player.team}</li>
                ))}
            </ul>
        </div>

    );
};

export default HostSetupPage;


