import React, { useState, useEffect } from 'react';
import { Routes, Route, HashRouter, useNavigate } from 'react-router-dom';
import StartPage from './pages/StartPage';
import HostGamePage from './pages/host/HostGamePage';
import PlayerGamePage from './pages/player/PlayerGamePage';
import './App.css';
import { CurrentGameProvider } from './contexts/CurrentGameContext';


function App() {
  return (
    <CurrentGameProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/host/:shortId" element={<HostGamePage />} />
          <Route path="/player/:shortId" element={<PlayerGamePage />} />
        </Routes>
      </HashRouter>
    </CurrentGameProvider>
  );
}

export default App;
