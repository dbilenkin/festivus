import React, { createContext, useState } from 'react';

const CurrentGameContext = createContext({
    gameRef: null,
    currentPlayerName: '',
    setGameRef: () => { },
    setCurrentPlayerName: () => { },
});

const CurrentGameProvider = ({ children, gameRef }) => {
    const [currentPlayerName, setCurrentPlayerName] = useState(() => {
        const storedName = localStorage.getItem('currentPlayerName');
        return storedName || '';
    });

    const setPlayerNameLocalStorage = (playerName) => {
        localStorage.setItem('currentPlayerName', playerName);
    };

    const handleNameChange = (playerName) => {
        setCurrentPlayerName(playerName);
        setPlayerNameLocalStorage(playerName);
    };

    const setGameRef = (ref) => {
        // Update gameRef and potentially trigger re-renders
        ref.onSnapshot((gameDoc) => {
            setCurrentPlayerName(gameDoc.data().currentPlayerName || '');
        });
    };

    const value = {
        gameRef,
        currentPlayerName,
        setGameRef,
        setCurrentPlayerName: handleNameChange,
    };

    return (
        <CurrentGameContext.Provider value={value}>{children}</CurrentGameContext.Provider>
    );
};

export { CurrentGameContext, CurrentGameProvider };
