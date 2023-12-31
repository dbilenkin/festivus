import actorData from './data.json';

export function generateShortId(id) {
    return id.slice(0, 4).toUpperCase();
}

export function getDeck(deckType) {

    if (deckType === "actors") {
        return actorData.filter((_, i) => i < 52).map(element => element.imageUrl);
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
