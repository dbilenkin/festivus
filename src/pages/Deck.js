import { useState, useReducer } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

import './Deck.css';
import data from './data.json';

// const cards = [
//   'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
//   'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
//   'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
//   'https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg',
//   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/690px-RWS_Tarot_02_High_Priestess.jpg',
//   'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
//   'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg/440px-Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg',
// ]

const cards = data.filter((_, i) => i < 52).map(element => element.imageUrl);

let zFlipped = false;
let maxZIndex = 900;

function Deck() {
  const [reviewed, setReviewed] = useState(() => new Set()) // cards to the left
  const [marked, setMarked] = useState(() => new Set()) // marked cards
  const [cardSet, setCardSet] = useState(() => new Set(cards));

  // These two are just helpers, they curate spring data, values that are later being interpolated into css
  const to = (i) => ({
    x: 0,
    y: 0,
    scale: 1,
    rot: -5 + Math.random() * 10,
    delay: i * 10,
    // zIndex: i + maxZIndex
  })
  const from = (_i) => ({ x: 0, rot: 0, scale: 1, y: -1000 })
  // This is being used down there in the view, it interpolates rotation and scale into a css transform
  const trans = (r, s) =>
    `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

  const [props, api] = useSprings(cards.length, i => ({
    ...to(i),
    from: from(i),
  })) // Create a bunch of springs using the helpers above

  const bind = useDrag(({ args: [index], active, movement: [mx, my], direction: [xDir, yDir], velocity: [vx, vy] }) => {

    if (!reviewed.has(index) && !marked.has(index)) {
      if (mx < -80) {
        const _reviewed = new Set(reviewed);
        _reviewed.add(index);
        setReviewed(_reviewed);
      } else if (my > 130) {
        const _marked = new Set(marked);
        _marked.add(index);
        setMarked(_marked);
      }
    }

    api.start(i => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const isReviewed = reviewed.has(index);
      const isMarked = marked.has(index);
      let x, y;
      let zIndex = index + 300;
      if (isReviewed) {
        x = -140;
        y = 0;
        zIndex = maxZIndex + reviewed.size;
      } else if (isMarked) {
        x = 0;
        y = 200;
        zIndex = 100 + marked.size;
      } else {
        x = active ? mx : 0;
        y = active ? my : 0;
        zIndex = active ? 2000 : maxZIndex + 100 + index;
      }
      // console.log({ x, y });
      const rot = mx / 100 + (isReviewed ? xDir * 10 * vx : 0) // How much the card tilts, flicking it harder makes it rotate faster
      // const rot = 0;
      const scale = active ? 1.1 : 1 // Active cards lift up a bit
      const flip = isMarked;
      return {
        x,
        y,
        zIndex,
        vx,
        vy,
        rot,
        scale,
        flip,
        delay: undefined,
        config: { friction: 50, tension: 500 },
      }
    })
    if (!active && (reviewed.size + marked.size) === cards.length) {
      maxZIndex -= 100;
      setTimeout(() => {
        setReviewed(new Set());
        api.start(i => {
          if (marked.has(i)) return;
          return {
            ...to(i),
            // zIndex: zFlipped ? 300 - i : 300 + i
          }
        })
      }, 300)
    }
  })
  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return (
    <div className='container'>
      {props.map(({ x, y, zIndex, rot, scale, flip, vx, vy }, i) => {
        if (!zIndex) {
          zIndex = 1000 + i;
        }

        return (
          <animated.div className='deck' key={i} style={{ x, y, zIndex }}>
            <animated.div
              {...bind(i)}
              style={{
                zIndex,
                // transform: trans(rot, scale, marked.has(i)),
                transform: interpolate([rot, scale], trans),
                // rotateX: marked.has(i) ? '180deg' : '',
                // backgroundImage: marked.has(i) ? `url(${cards[0]}` : `url(${cards[i]})`,
                backgroundImage: `url(${cards[i]})`,
              }}
            ></animated.div>
          </animated.div>
        );
      }
      )}
    </div>
  )
}

export default Deck;
