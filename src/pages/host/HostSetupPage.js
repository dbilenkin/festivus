
import React from 'react';
import Nav from '../../components/Nav';
import { displayFormattedDeckType, displayGameLength, displayWordSelection } from '../../utils/utils';

const HostSetupPage = ({ gameData, players }) => {

  const { shortId } = gameData;

  return (
    <div className="">
      <Nav className="max-w-screen-md" />
      <div className="max-w-screen-md mx-auto p-4 text-gray-200"> {/* text color adjusted for dark background */}
        <h2 className="bg-gray-800 text-gray-200 text-xl font-bold mb-4 p-4 text-gray-200 rounded-lg">
          Game Code: <span className='text-green-500'>{shortId}</span>
        </h2>
        <div className='mt-4 p-4 bg-gray-800 rounded-lg'>
          <div className="pb-2 border-b-2 border-gray-700 text-left text-lg">
            Joined Players
          </div>
          <div className="pt-2 text-lg font-bold">
            {players.map(p => p.name).join(", ")}
          </div>
        </div>
        <div className='mt-4 p-4 bg-gray-800 rounded-lg text-lg'>
          <label htmlFor="deckType" className="block">
            Deck: <span className='font-bold'>{displayFormattedDeckType(gameData.deckType)}</span>
          </label>
        </div>
        <div className='mt-4 p-4 bg-gray-800 rounded-lg text-lg'>
          <label htmlFor="deckType" className="block font-normal">
            Game Length: <span className='font-bold'>{displayGameLength(gameData.gameLength)}</span>
          </label>
        </div>
        <div className='mt-4 p-4 bg-gray-800 rounded-lg text-lg'>
          <label htmlFor="deckType" className="block font-normal">
            Word Selection: <span className='font-bold'>{displayWordSelection(gameData.wordSelection)}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default HostSetupPage;


