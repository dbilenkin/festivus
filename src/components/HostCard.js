
import React, { useContext } from 'react';
import './HostCard.css';
import cardback from './card-back.jpg';

function HostCard({ deck, cardIndex, flipped }) {

    return (
        <div className='card'
            style={{
                width: 100,
                height: 140,
                backgroundImage: flipped ? `url(${deck[cardIndex]})` : `url(${cardback})`,
                // backgroundImage: `url(${cardback})`
            }}
        ></div>)
}

export default HostCard;