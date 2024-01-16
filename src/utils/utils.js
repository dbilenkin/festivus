import movieStars from './celebrities.json';
import actors from './actors.json';
import actresses from './actresses.json';

const actorsAndActresses = [...actors, ...actresses];
const deckSize = 26;
let randomChoices = [];
let deck = [];
let indexDeck = [];

export function generateShortId(id) {
  return id.slice(0, 4).toUpperCase();
}

export function createIndexDeck(deckLength) {
  for (let i = 0; i < deckSize; i++) {
    let randomIndexFound = false;
    while (!randomIndexFound) {
      const randomTry = Math.floor(Math.random() * deckLength)
      if (!indexDeck.includes(randomTry)) {
        indexDeck.push(randomTry);
        randomIndexFound = true;
      }
    }
  }
}

export function getIndexDeck(deckType) {
  if (indexDeck && indexDeck.length > 0) return indexDeck;

  if (deckType === "movieStars") {
    createIndexDeck(movieStars.length);
  } else if (deckType === "actors") {
    createIndexDeck(actors.length);
  } else if (deckType === "actresses") {
    createIndexDeck(actresses.length);
  } else if (deckType === "actorsAndActresses") {
    createIndexDeck(actorsAndActresses.length);
  } else {
    createIndexDeck(52);
  }

  return indexDeck;
}

export function getDeck(_indexDeck, deckType) {

  if (deck.length > 0) return deck;

  if (deckType === "movieStars") {
    deck = movieStars.filter((_, i) => _indexDeck.includes(i));
  } else if (deckType === "actors") {
    deck = actors.filter((_, i) => _indexDeck.includes(i));
  } else if (deckType === "actresses") {
    deck = actresses.filter((_, i) => _indexDeck.includes(i));
  } else if (deckType === "actorsAndActresses") {
    deck = actorsAndActresses.filter((_, i) => _indexDeck.includes(i));
  } else {
    for (let i = 0; i < deckSize; i++) {
      const randomI = _indexDeck[i];
      const imageName = `${deckType}-${randomI}.jpg`; // Construct the image name
      const imageUrl = `decks/${deckType}/${imageName}`; // Construct the image path
      deck.push({
        name: '',
        imageUrl
      });
    }

    deck.reverse();
  }
  return deck;
}

export function getCardMatchScore(cardIndex1, cardIndex2) {
  return (10 - (cardIndex1 + cardIndex2)) * (10 - Math.abs(cardIndex1 - cardIndex2));
}

export function getCardScores(cards1, cards2) {
  let score = 0;
  for (let i = 0; i < cards1.length; i++) {
    const card = cards1[i];
    if (card === cards2[i]) {
      score += getCardMatchScore(i, i);
    } else if (cards2.indexOf(card) !== -1) {
      score += getCardMatchScore(i, cards2.indexOf(card));
    }
  }
  return score;
}

export function getOrdinal(i) {
  let j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
}