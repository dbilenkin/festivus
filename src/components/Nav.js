import React from 'react';
import { Link } from 'react-router-dom';

const Nav = ({ className, word, round, name  }) => {

  return (
    <nav className="bg-gray-800 text-gray-300 border-b border-gray-500">
      <div className={`mx-auto px-4 py-3 flex justify-between items-center ${className}`}>
        <Link to={`/`}><h1 className="text-xl font-bold">Incommon</h1></Link>
        {word && <div>
          <p className="text-lg">{word}</p>
        </div>}
        {round && <div>
          <p className="text-lg">Round {round}</p>
        </div>}
        {name && <div>
          <p className="text-lg">{name}</p>
        </div>}
      </div>
    </nav>
  );
};

export default Nav;



