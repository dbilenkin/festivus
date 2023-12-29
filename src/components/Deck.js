import { useState, useEffect, useRef, createRef } from 'react'
import { useSpring, useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { CheckIcon } from '@heroicons/react/24/solid';
import { cards } from '../utils/utils';

import './Deck.css';

let maxZIndex = 900;
const markedY = 220;

const cardStates = ["ready", "toReviewed", "reviewed", "toReady", "toMarked", "marked"];
const cardSet = cards.map(card => "ready");

function Deck({ gameData, handleSelectCards }) {
  const [firstPassDone, setFirstPassDone] = useState(false);
  const [hoveredBox, setHoveredBox] = useState(null);
  const [assignedBoxes, setAssignedBoxes] = useState([]); // { cardIndex: boxIndex }

  const boxRefs = useRef([]);

  // Create refs for your boxes
  useEffect(() => {
    boxRefs.current = Array.from({ length: 5 }, () => createRef());
  }, []);


  // Animation for boxes
  const boxAnimation = useSpring({
    from: { y: 1000 }, // Start from below the view
    to: { y: firstPassDone ? 180 : 1000 }, // Slide up if showBoxes is true
    config: { tension: 200, friction: 20 }
  });

  // JSX for boxes
  const boxes = (
    <div className="box-container flex flex-wrap justify-center items-center mt-4 max-h-screen">
      {boxRefs.current.length > 0 && boxRefs.current.map((ref, i) => (
        <animated.div
          key={i}
          ref={ref}
          className={`box ${hoveredBox === i ? 'bg-[#EDAE49]' : 'bg-blue-500'} 
          text-white p-6 m-1 rounded-lg shadow-lg flex items-center justify-center 
          text-2xl font-bold w-28 h-[152px] ${i > 2 ? 'mt-2' : ''}`}
          style={boxAnimation}
        >
          {i + 1}
        </animated.div>
      ))}
    </div>
  );

  const to = (i) => {
    const boxed = cardSet[i].startsWith("box");
    const ready = cardSet[i] === "ready";
    const marked = cardSet[i] === "marked";
    const deck = cardSet[i] === "deck";

    let returnValues = {
      // x: 0,
      // y: marked ? 0 : -1000,
      width: 150,
      height: 210,
      scale: 1,
      rot: -3 + Math.random() * 6,
      delay: i * 10,
    }
    if (firstPassDone) {
      if (boxed) {
        return {
          ...returnValues,
          width: 100,
          height: 140,
          zIndex: 1000,
        }
      } else if (ready) {
        return {
          ...returnValues,
          x: 0,
          y: 0,
          width: 100,
          height: 140,
        }
      } else {
        return {
          ...returnValues,
          x: 0,
          y: -1000
        }
      }
    } else {
      if (boxed) {
        return {
          ...returnValues,
          y: 2000,
        }
      } else if (marked) {
        return {
          ...returnValues,
          x: 0,
          y: markedY,
          zIndex: maxZIndex - i,
        }
      } else {
        return {
          ...returnValues,
          x: 0,
          y: 0,
          zIndex: i + maxZIndex
        }
      }
    }
  }
  const from = (_i) => ({ x: 0, rot: 0, scale: 1, y: -1000 })
  // This is being used down there in the view, it interpolates rotation and scale into a css transform
  const trans = (r, s) =>
    `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

  const transBoxes = () => "scale(1)";

  const [props, api] = useSprings(cards.length, i => ({
    ...to(i),
    from: from(i),
  }))

  const handleCheckboxChange = () => {
    setFirstPassDone(!firstPassDone);
    if (!firstPassDone) {
      for (let i = 0; i < cardSet.length; i++) {
        if (cardSet[i] === "reviewed" || cardSet[i] === "ready") {
          cardSet[i] = "deck";
        } else if (cardSet[i] === "marked") {
          cardSet[i] = "ready";
        }
      }
      const updatedBoxes = [...assignedBoxes];
      updatedBoxes[5] = "placeholder" + Math.random();
      setAssignedBoxes(updatedBoxes);
    } else {
      for (let i = 0; i < cardSet.length; i++) {
        if (cardSet[i] === "deck") {
          cardSet[i] = "ready";
        } else if (cardSet[i] === "ready") {
          cardSet[i] = "marked";
        }
      }
    }
  };

  useEffect(() => {
    api.start(i => {
      let _to = { ...to(i) };
      if (firstPassDone) {
        _to = { ..._to, width: 120, height: 168, scale: 1, rot: 0 };
      }
      return _to; // Update positions for other cards
    });

  }, [firstPassDone]);

  const getBoxPosition = boxIndex => {
    if (boxIndex === 5) {
      return {
        x: 0,
        y: 0,
      }
    }
    const box = boxRefs.current[boxIndex].current;

    return {
      x: box.offsetLeft - 249,
      y: box.offsetTop + 186,
    }
  }

  useEffect(() => {
    // console.log({ assignedBoxes });
    if (assignedBoxes.every(el => el !== undefined)) {
      console.log("full pick");
    }
    api.start(i => {
      const numMarked = cardSet.filter(cardState => cardState === "marked").length;
      const boxIndex = assignedBoxes.findIndex(el => el === i);
      if (boxIndex !== -1) {
        const { x, y } = getBoxPosition(boxIndex);

        // Calculate new position based on the box position
        return {
          x,
          y,
          scale: 1,
          rot: 0,
          zIndex: i === 5 ? numMarked + maxZIndex : 1000
        };
      }
      // Return to original position or other logic for cards not in a box
      return {
        // Existing properties for cards not in a box
      };
    });
  }, [assignedBoxes]);

  const moveCardsDown = (cardIndex, boxIndex, updatedBoxes) => {
    if (boxIndex > 4) {
      cardSet[cardIndex] = "marked";
      updatedBoxes[boxIndex] = cardIndex;
    } else {
      const existingCardIndex = updatedBoxes[boxIndex];
      updatedBoxes[boxIndex] = cardIndex;
      cardSet[cardIndex] = "box" + boxIndex;
      if (Number.isInteger(existingCardIndex)) {
        moveCardsDown(existingCardIndex, boxIndex + 1, updatedBoxes);
      }
    }
  }


  const bind = useDrag(({ args: [index], active, xy: [x, y], movement: [mx, my], offset: [ox, oy], direction: [xDir, yDir], velocity: [vx, vy] }) => {

    let cardState = cardSet[index];

    switch (cardState) {
      case "ready":
        if (my > 110 && !firstPassDone) {
          cardSet[index] = "readyToMarked";
        } else if (mx < -80) {
          cardSet[index] = "toReviewed";
        }
        break;
      case "reviewed":
        if (my > 90 && !firstPassDone) {
          cardSet[index] = "reviewedToMarked";
        } else if (mx > 80) {
          cardSet[index] = "toReady";
        }
        break;
      default:
        break;
    }

    if (active) {
      let isHovering = false;
      const cardRect = {
        width: 90,
        height: 160,
        x: x,
        y: y,
      };
      boxRefs.current.forEach((ref, boxIndex) => {
        if (ref.current) {
          const box = ref.current;
          const boxRect = box.getBoundingClientRect();
          const xOffset = -90;
          const yOffest = -160;
          if (
            cardRect.x + xOffset < boxRect.right &&
            cardRect.x + xOffset + cardRect.width > boxRect.left &&
            cardRect.y + yOffest < boxRect.bottom &&
            cardRect.y + yOffest + cardRect.height > boxRect.top
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
      // console.log({ hoveredBox, index });
      if (Number.isInteger(hoveredBox) && Number.isInteger(index) && !Object.hasOwn(assignedBoxes, index)) {
        const updatedBoxes = [...assignedBoxes];
        const originalBoxIndex = updatedBoxes.findIndex(box => box === index);
        if (originalBoxIndex !== -1) {
          updatedBoxes[originalBoxIndex] = null;
        }
        const existingCardInex = updatedBoxes[hoveredBox];
        if (Number.isInteger(existingCardInex)) {
          moveCardsDown(existingCardInex, hoveredBox + 1, updatedBoxes);
        }
        updatedBoxes[hoveredBox] = index;
        setAssignedBoxes(updatedBoxes);
        cardSet[index] = "box" + hoveredBox;
      }
      setHoveredBox(null);
    }

    api.start(i => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      cardState = cardSet[i]; //recalculate cardState after possible movingDown

      let newX = mx;
      let newY = my;
      let zIndex = 2000;
      const numReviewed = cardSet.filter(cardState => cardState === "reviewed").length;
      const numMarked = cardSet.filter(cardState => cardState === "marked").length;

      switch (cardState) {
        case "ready":
          if (!active) {
            newX = 0;
            newY = 0;
            zIndex = i + maxZIndex;
          }
          break;
        case "toReviewed":
          if (!active) {
            newX = -180;
            newY = 0;
            zIndex = numReviewed + maxZIndex;
            cardSet[i] = "reviewed";
          }
          break;
        case "reviewed":
          if (active) {
            newX = mx - 180;
          } else {
            newX = -180;
            newY = 0;
            zIndex = numReviewed + maxZIndex;
          }
          break;
        case "toReady":
          if (active) {
            newX = mx - 180;
          } else {
            newX = 0;
            newY = 0;
            zIndex = i + maxZIndex;
            cardSet[i] = "ready";
          }
          break;
      }

      if (firstPassDone) {
        if (cardState === "ready" || cardState === "reviewed") {
          if (!active) {
            newX = 0;
            newY = 0;
            zIndex = i + maxZIndex;
          }
        } else if (cardState.startsWith("box")) {
          const boxIndex = parseInt(cardState.charAt(3));
          const { x, y } = getBoxPosition(boxIndex);
          newX = mx + x;
          newY = my + y;
        }
      } else {
        switch (cardState) {
          case "readyToMarked":
            if (!active) {
              newX = 0;
              newY = markedY;
              zIndex = numMarked + maxZIndex;
              cardSet[i] = "marked";
            }
            break;
          case "reviewedToMarked":
            if (active) {
              newX = mx - 180;
            } else {
              newX = 0;
              newY = markedY;
              zIndex = numMarked + maxZIndex;
              cardSet[i] = "marked";
            }
            break;
          case "marked":
            // if (active) {
            newX = 0;
            newY = markedY;
            zIndex = numMarked + maxZIndex;
            // }
            break;
          default:
            break;
        }
      }

      const scale = active ? 1.1 : 1 // Active cards lift up a bit
      return {
        x: newX,
        y: newY,
        zIndex,
        vx,
        vy,
        scale,
        delay: 0,
        config: { friction: 40, tension: 400, mass: 1 },
        immediate: key => key === 'zIndex' && active,
      }
    })
  })

  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return (
    <div>
      <div className='px-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <label htmlFor="firstPassCheckbox" className="switch flex items-center cursor-pointer ">
            <input
              type="checkbox"
              checked={firstPassDone}
              onChange={handleCheckboxChange}
              id="firstPassCheckbox"
              className="hidden" // Hide the default checkbox
            />
            <span className={`slider round ${firstPassDone ? 'bg-blue-500' : 'bg-gray-200'}`}></span>
          </label>
          {firstPassDone ? <span className='text-sm ml-2'>Back to Deck</span> : <span className="text-md ml-2">Ready to Order</span>}
        </div>
        <button
          style={{
            display: firstPassDone ? 'block' : 'none'
          }}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          onClick={() => handleSelectCards(assignedBoxes)}>
          Submit Cards
        </button>
      </div>
      <div className='relative' style={{ top: -10 }}>

        {props.map(({ x, y, width, height, zIndex, rot, scale, flip, vx, vy }, i) => {
          const boxIndex = assignedBoxes.findIndex(el => el === i);
          const cardPicked = boxIndex !== -1 && boxIndex < 5;
          const correctTrans = cardPicked ? transBoxes : trans;
          if (cardPicked) {
            width = 100;
            height = 140;
          }

          return (
            <animated.div className='deck' key={i} style={{ x, y, zIndex }}>
              <animated.div
                {...bind(i)}
                style={{
                  zIndex,
                  width,
                  height,
                  // transform: trans(rot, scale, marked.has(i)),
                  transform: interpolate([rot, scale], correctTrans),
                  // rotateX: marked.has(i) ? '180deg' : '',
                  // backgroundImage: marked.has(i) ? `url(${cards[0]}` : `url(${cards[i]})`,
                  backgroundImage: `url(${cards[i]})`,
                  // immediate: true // Or remove for an animated transition
                  // backgroundImage: `url(${cardback})`
                }}
              ></animated.div>
            </animated.div>
          );
        }
        )}
        {boxes}
      </div>
    </div>
  )
}

export default Deck;
