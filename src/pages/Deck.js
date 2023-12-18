import { useState, useEffect, useRef, createRef } from 'react'
import { useSpring, useSprings, animated, to as interpolate } from '@react-spring/web'
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
const markedY = 160;

function Deck() {
  const [reviewed, setReviewed] = useState(() => new Set()) // cards to the left
  const [marked, setMarked] = useState(() => new Set()) // marked cards
  const [cardSet, setCardSet] = useState(() => new Set(cards));
  const [firstPassDone, setFirstPassDone] = useState(false);
  const [hoveredBox, setHoveredBox] = useState(null);
  const [assignedBoxes, setAssignedBoxes] = useState({}); // { cardIndex: boxIndex }

  const boxRefs = useRef([]);

  // Create refs for your boxes
  useEffect(() => {
    boxRefs.current = Array.from({ length: 5 }, () => createRef());
  }, []);


  // Animation for boxes
  const boxAnimation = useSpring({
    from: { y: 1000 }, // Start from below the view
    to: { y: firstPassDone ? 200 : 1000 }, // Slide up if showBoxes is true
    config: { tension: 200, friction: 20 }
  });

  // JSX for boxes
  const boxes = (
    <div className="box-container flex flex-wrap justify-center items-center mt-4 max-h-screen">
      {boxRefs.current.length > 0 && boxRefs.current.map((ref, i) => (
        <animated.div
          key={i}
          ref={ref}
          className={`box ${hoveredBox === i ? 'bg-green-500' : 'bg-blue-500'} 
          text-white p-6 m-1 rounded-lg shadow-lg flex items-center justify-center 
          text-2xl font-bold w-28 h-40 ${i > 2 ? 'mt-2' : ''}`}
          style={boxAnimation}
        >
          {i + 1}
        </animated.div>
      ))}
    </div>
  );

  const to = (i) => {
    // console.log({ firstPassDone })
    return {
      x: 0,
      y: firstPassDone ? (marked.has(i) ? 0 : -1000) : (marked.has(i) ? markedY : 0),
      // The marked cards will slide into position, others will slide out of view
      // zIndex: firstPassDone ? (marked.has(i) ? 1000 : 0) : i,
      scale: 1,
      rot: -5 + Math.random() * 10,
      delay: i * 10,
      // zIndex: i + maxZIndex
    }
  }
  const from = (_i) => ({ x: 0, rot: 0, scale: 1, y: -1000 })
  // This is being used down there in the view, it interpolates rotation and scale into a css transform
  const trans = (r, s) =>
    `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

  const [props, api] = useSprings(cards.length, i => ({
    ...to(i),
    from: from(i),
  })) // Create a bunch of springs using the helpers above

  // Checkbox handler
  const handleCheckboxChange = () => {
    setFirstPassDone(!firstPassDone);
  };

  useEffect(() => {
    api.start(i => {
      return to(i); // Update positions for other cards
    });

  }, [firstPassDone]);

  useEffect(() => {
    api.start(i => {
      const boxIndex = assignedBoxes[i];
      if (boxIndex !== undefined) {
        const box = boxRefs.current[boxIndex].current;
        const boxRect = box.getBoundingClientRect();
  
        // Calculate new position based on the box position
        return {
          x: boxRect.left - 200,
          y: boxRect.top - 100,
          immediate: true // Or remove for an animated transition
        };
      }
      // Return to original position or other logic for cards not in a box
      return {
        // Existing properties for cards not in a box
      };
    });
  }, [assignedBoxes]);
  

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

    if (active && marked.has(index)) {
      let isHovering = false;
      const cardRect = {
        width: 90,
        height: 160,
        x: mx,
        y: my,
      };
      boxRefs.current.forEach((ref, boxIndex) => {
        if (ref.current) {
          const boxRect = ref.current.getBoundingClientRect();
          if (
            cardRect.x + 170 < boxRect.right &&
            cardRect.x + 170 + cardRect.width > boxRect.left &&
            cardRect.y < boxRect.bottom &&
            cardRect.y + cardRect.height > boxRect.top
          ) {
            // Card is over boxIndex
            setHoveredBox(boxIndex);
            isHovering = true;

          }
        }
      });
      if (!isHovering) setHoveredBox(null);
    }

    if (!active) {
      console.log({ hoveredBox, index });
      if (Number.isInteger(hoveredBox) && Number.isInteger(index)) {
        setAssignedBoxes(prev => ({ ...prev, [index]: hoveredBox }));
      }
      setHoveredBox(null);
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
      } else if (isMarked && !firstPassDone) {
        x = 0;
        y = markedY;
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
      <input
        type="checkbox"
        checked={firstPassDone}
        onChange={handleCheckboxChange}
        id="firstPassCheckbox"
      />
      <label htmlFor="firstPassCheckbox">Done with first pass</label>
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
      {boxes}
    </div>
  )
}

export default Deck;
