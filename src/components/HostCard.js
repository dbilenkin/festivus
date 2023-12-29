
import React, { useContext } from 'react';
import './HostCard.css';
import cardback from './card-back.jpg';
import { CurrentGameContext } from '../contexts/CurrentGameContext';

function HostCard({ cardIndex, flipped }) {
    const { cards } = useContext(CurrentGameContext); // Access context

    return (
        <div className='card'
            style={{
                width: 100,
                height: 140,
                backgroundImage: flipped ? `url(${cards[cardIndex]})` : `url(${cardback})`,
                // backgroundImage: `url(${cardback})`
            }}
        ></div>)
}

export default HostCard;