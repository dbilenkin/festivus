
import React from 'react';
import Nav from '../../components/Nav';

const HostSetupPage = ({ gameData, players }) => {

  const { shortId } = gameData;

  return (
    <div>
      <Nav className="max-w-screen-md"/>
      <div className="max-w-screen-md mx-auto p-4 text-gray-800">
        <h2 className="text-2xl font-bold mb-4">Game ID: {shortId}</h2>
        <h2 className="block text-gray-700 text-sm font-bold mb-2">Joined Players:</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-5 py-3 border-b-2 border-gray-200 text-gray-800 text-left text-sm uppercase font-normal">Player Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-gray-800 text-left text-sm uppercase font-normal">Team</th>
              </tr>
            </thead>
            <tbody>
              {players && players.map(player => (
                <tr key={player.name} className="hover:bg-gray-100">
                  <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{player.name}</td>
                  <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{player.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HostSetupPage;


