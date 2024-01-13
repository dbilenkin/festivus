import actorData from './data.json';
const actorChoices = [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 26, 27, 28, 29, 30, 31, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];

export function generateShortId(id) {
  return id.slice(0, 4).toUpperCase();
}

export function getDeck(deckType) {

  if (deckType === "actors") {
    return actorData.filter((_, i) => actorChoices.includes(i+1)).map(element => element.imageUrl);
  } else {
    const deck = [];

    for (let i = 0; i < 52; i++) {
      const imageName = `${deckType}-${i}.jpg`; // Construct the image name
      const imagePath = `decks/${deckType}/${imageName}`; // Construct the image path
      deck.push(imagePath);
    }

    deck.reverse();

    return deck;
  }
}

export function getCardMatchScore(cardIndex1, cardIndex2) {
  return (10 - (cardIndex1 + cardIndex2)) * (10 - Math.abs(cardIndex1 - cardIndex2));
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