import React from 'react';
import { Link } from 'react-router-dom';

const Nav = ({ className, phrase, round, name  }) => {

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className={`mx-auto px-4 py-3 flex justify-between items-center ${className}`}>
        <Link to={`/`}><h1 className="text-xl font-bold">Incommon</h1></Link>
        {phrase && <div>
          <p className="text-md">{phrase}</p>
        </div>}
        {round && <div>
          <p className="text-md">Round {round}</p>
        </div>}
        {name && <div>
          <p className="text-md">{name}</p>
        </div>}
      </div>
    </nav>
  );
};

export default Nav;



