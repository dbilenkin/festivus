import data from './data.json';

export function generateShortId(id) {
    return id.slice(0, 4).toUpperCase();
}

const cards = data.filter((_, i) => i < 52).map(element => element.imageUrl);

export { cards };