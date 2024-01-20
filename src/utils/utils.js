import celebrities from './dataFiles/celebrities.json';
import actors from './dataFiles/actors.json';
import famousPeople from './dataFiles/famousPeople.json';
import animals from './dataFiles/animals.json';
import listOfNames from './dataFiles/listsOfNames.json';

const deckSize = 26;
let deck = [];
let indexDeck = [];
let createdDeckType = "";

export function generateShortId(id) {
  const shortIdLength = 4;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let shortId = '';
  for (let i = 0; i < shortIdLength; i++) {
    const letterIndex = Math.floor(Math.random() * letters.length);
    const randomLetter = letters[letterIndex];
    shortId += randomLetter;
  }

  return shortId;
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

  switch (deckType) {
    case "celebrities":
    case "actors":
    case "famousPeople":
    case "animals":
      createIndexDeck(listOfNames[deckType].length);
      break;
    case "original":
      createIndexDeck(52);
      break;
    default:
      break;
  }

  return indexDeck;
}

export function getDeck(_indexDeck, deckType) {

  if (deckType === createdDeckType && deck.length > 0) return deck;

  switch (deckType) {
    case "celebrities":
    case "actors":
    case "famousPeople":
    case "animals":
      for (let i = 0; i < deckSize; i++) {
        const randomI = _indexDeck[i];
        const name = listOfNames[deckType][randomI].name;
        const imageUrl = `decks/${deckType}/${listOfNames[deckType][randomI].imageUrl}`;
        deck.push({
          name,
          imageUrl
        });
      }
      break;
    case "original":
      for (let i = 0; i < deckSize; i++) {
        const randomI = _indexDeck[i];
        const imageName = `${deckType}-${randomI}.jpg`; // Construct the image name
        const imageUrl = `decks/${deckType}/${imageName}`; // Construct the image path
        deck.push({
          name: '',
          imageUrl
        });
      }
      break;
    default:
      break;
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


export function displayGameLength(numRounds = 3) {
  const gameLengths = { 3: "Short", 5: "Medium", 10: "Long" };
  return gameLengths[numRounds];
}

export function displayFormattedDeckType(deckType = "original") {
  const deckTypes = { original: "Original", actors: "Actors", celebrities: "Celebrities", famousPeople: "Famous People", animals: "Animals" };
  return deckTypes[deckType];
}
