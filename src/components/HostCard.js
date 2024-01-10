import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import './HostCard.css';
import cardback from './card-back.jpg';

function HostCard({ deck, cardIndex, placeholder, flip, position, backToChosenCards, highlight }) {

  const [cardSize, setCardSize] = useState({ width: 80, height: 112 });

  const translateY = position;

  // Combined flip, scale, and translate animation
  const [{ transform, opacity, zIndex, boxShadow }, set] = useSpring(() => ({
    boxShadow: '0 12.5px 10px -10px rgba(50, 50, 73, 0.4)',
    opacity: 1,
    transform: `perspective(600px) rotateY(0deg) scale(1)`,
    zIndex: 0,
    config: { mass: 5, tension: 300, friction: 100 }
  }));

  useEffect(() => {
    set({
      transform: `perspective(600px) rotateY(${flip ? 180 : 0}deg) scale(${flip ? 1.3 : 1}) translateY(${flip ? translateY : '0px'})`,
      zIndex: flip ? 10 : 0,
      opacity: flip ? 1 : 0,
      immediate: key => key === 'zIndex',
    });

    if (backToChosenCards) {
      set({ transform: `perspective(600px) rotateY(180deg) scale(1) translateY(0px)`, zIndex: 0 });
    }
  }, [flip, backToChosenCards, set, translateY]);

  useEffect(() => {
    if (highlight) {
      const translateY = highlight === "top" ? "-20px" : "20px";
      set({ 
        boxShadow: '0 0 20px 10px gold',
        transform: `perspective(600px) rotateY(180deg) scale(1.3) translateY(${translateY})`, 
        zIndex: 100,
        immediate: key => key === 'zIndex',
      });

      setTimeout(() => {
        set({ 
          boxShadow: '0 12.5px 10px -10px rgba(50, 50, 73, 0.4)',
          transform: `perspective(600px) rotateY(180deg) scale(1) translateY(0px)`, 
          zIndex: 10 });
      }, 1500);
    }
  }, [highlight])



  useEffect(() => {
    function handleResize() {
      let newWidth = Math.min(window.innerHeight / 7.7, 100);
      let newHeight = Math.min(window.innerHeight / 5.5, 140);
      setCardSize({ width: newWidth, height: newHeight });
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Card styles
  const cardStyle = {
    position: 'relative',
    width: cardSize.width,
    height: cardSize.height,
    zIndex: zIndex,
  };

  // Card face styles
  const cardFaceStyle = {
    position: 'absolute', // Card faces are absolute
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '4px',
    borderColor: '#dd5833',
    boxShadow,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden', // Hide the back side when it is facing away
    backgroundImage: `url(${cardback})`,
    position: 'absolute',
    opacity: opacity.to(o => 1 - o),
    transform,
    transformStyle: 'preserve-3d',
  };

  return (
    placeholder ?
      <div style={{
        width: cardSize.width,
        height: cardSize.height,
        borderStyle: 'dashed',
        borderWidth: '2px',
        borderColor: '#212529',
        borderRadius: '8px',
      }}></div>
      :
      <animated.div style={cardStyle}>
        <animated.div className='card'
          style={{...cardFaceStyle,
            backgroundImage: `url(${cardback})`,
            opacity: opacity.to(o => 1 - o),
          }}
        ></animated.div>
        <animated.div className={'card ' + (highlight ? 'highlight' : '')}
          style={{...cardFaceStyle,
            backgroundImage: `url(${deck[cardIndex]})`,
            opacity,
            rotateY: "180deg",
          }}
        ></animated.div>
      </animated.div>
  );
}

export default HostCard;
