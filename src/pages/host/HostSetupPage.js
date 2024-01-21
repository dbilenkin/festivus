
import React, { useEffect } from 'react';
import { animated, useTransition } from '@react-spring/web';
import Nav from '../../components/Nav';
import { displayFormattedDeckType, displayGameLength, displayWordSelection } from '../../utils/utils';
import Button from '../../components/Button';

const HostSetupPage = ({ gameData, players }) => {

  const { shortId } = gameData;

  useEffect(() => {
    if (players.length > 0) {
      const audio = new Audio('sounds/whoosh.mp3'); // assuming pop.mp3 is in the public folder
      audio.play().catch(error => console.log('Error playing the sound:', error));
    }
  }, [players]);

  const randomPosition = () => {
    const up = Math.random() > .5;
    const y = up ? Math.random() * 1000 - 1000 : Math.random() * 1000 + 1000;
    const x = Math.random() * 3000 - 1000;
    return `translate3d(${x}px, ${y}px, 0)`;
  };

  const transitions = useTransition(players, {
    from: item => ({ transform: randomPosition(), opacity: 0 }),
    enter: { transform: 'translate3d(0,0,0)', opacity: 1 },
    leave: { transform: 'translate3d(0,-100px,0)', opacity: 0 },
    keys: player => player.id,
  });

  const colors = ['red','orange','yellow','green','blue','indigo','violet','purple']

  return (
    <div className="">
      <Nav className="max-w-screen-md" />
      <div className="max-w-screen-md mx-auto p-4 text-gray-200"> {/* text color adjusted for dark background */}
        <h2 className="bg-gray-800 text-gray-200 text-4xl font-bold mb-4 p-6 text-gray-200 rounded-lg">
          Game Code: <span className='text-green-500'>{shortId}</span>
        </h2>
        <div className='mt-4 p-6 bg-gray-800 rounded-lg'>
          <div className="pb-2 border-b-2 border-gray-700 text-left text-2xl">
            Joined Players
          </div>
          <div className="pt-2 text-lg font-bold flex">
            {transitions((styles, player, index) => (
              <animated.div style={styles} className="text-lg font-bold" key={player.id}>
                {/* Apply random colors or styles here */}
                <div className={`bg-blue-700 text-white py-2 px-4 mr-2 mt-2 rounded-full`}>
                  {player.name}
                </div>
              </animated.div>
            ))}
          </div>
        </div>
        <div className='mt-4 p-6 bg-gray-800 rounded-lg text-2xl'>
          <label htmlFor="deckType" className="block">
            Deck: <span className='font-bold'>{displayFormattedDeckType(gameData.deckType)}</span>
          </label>
          <label htmlFor="deckType" className="block font-normal">
            Game Length: <span className='font-bold'>{displayGameLength(gameData.gameLength)}</span>
          </label>
          <label htmlFor="deckType" className="block font-normal">
            Word Selection: <span className='font-bold'>{displayWordSelection(gameData.wordSelection)}</span>
          </label>
        </div>
        <Button className="mt-4">Allow Sounds</Button>
      </div>
    </div>
  );
};

export default HostSetupPage;


