
import React from 'react';
import Nav from '../../components/Nav';
import { displayFormattedDeckType, displayGameLength } from '../../utils/utils';

const HostSetupPage = ({ gameData, players }) => {

  const { shortId } = gameData;

  return (
    <div className="">
      <Nav className="max-w-screen-md" />
      <div className="max-w-screen-md mx-auto p-4 text-gray-100"> {/* text color adjusted for dark background */}
        <h2 className="bg-gray-800 text-gray-200 text-xl font-bold mb-4 p-4 text-gray-100 rounded-lg">Game ID: {shortId}</h2>
        <div className="overflow-x-auto rounded-lg text-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-800"> {/* darker header background */}
                <th className="px-5 py-3 border-b-2 border-gray-700 text-gray-300 text-left uppercase font-bold">Joined Players</th>
                {/* <th className="px-5 py-3 border-b-2 border-gray-700 text-gray-300 text-left text-sm uppercase font-normal">Team</th> */}
              </tr>
            </thead>
            <tbody>
              <tr className="">
                <td className="px-4 py-2 border-b border-gray-700 bg-gray-800 text-gray-300">
                  {players.map(p => p.name).join(", ")}
                </td>
                {/* <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{player.team}</td> */}
              </tr>
            </tbody>
          </table>
        </div>
        <div className='mt-4 p-4 bg-gray-800 rounded-lg text-lg'>
          <label htmlFor="deckType" className="block font-normal">
            Deck: <span className='font-bold'>{displayFormattedDeckType(gameData.deckType)}</span>
          </label>
        </div>
        <div className='mt-4 p-4 bg-gray-800 rounded-lg text-lg'>
          <label htmlFor="deckType" className="block font-normal">
            Game Length: <span className='font-bold'>{displayGameLength(gameData.gameLength)}</span>
          </label>
        </div>
      </div>
    </div>

  );
};

export default HostSetupPage;


