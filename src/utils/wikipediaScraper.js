const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const imdbMostPopular = 'https://www.imdb.com/list/ls052283250/';
const imdbTopActors = 'https://www.imdb.com/list/ls000004615/';
const imdbTopActresses = 'https://www.imdb.com/list/ls063784435/';
const wikiUrl = 'https://en.wikipedia.org/wiki/';




async function scrape(url, fileName) {
  let names = [];
  const response = await axios.get(url);

  const html = response.data;
  const $ = cheerio.load(html);

  $('.lister-item.mode-detail').each((i, elem) => {
    const name = $(elem).find('.lister-item-header a').text().trim();
    const wikiName = name.split(" ").join("_");
    names.push(wikiName);
  });

  console.log(names); // Outputs the scraped data
  getWikiImages(names, fileName);

}

async function getWikiImages(names, fileName) {
  let data = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const response = await axios.get(wikiUrl + name);

    const html = response.data;
    const $ = cheerio.load(html);

    const imageUrl = $('table.infobox').find('img').attr('src');
    if (imageUrl) {
      data.push({
        name,
        imageUrl
      });
    }
  }
  writeFile(data, fileName);
}

function writeFile(data, fileName) {
  fs.writeFile(fileName + '.json', JSON.stringify(data, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Data written to ' + fileName);
    }
  });
}

const fileName = 'celebrities';
const file = fs.readFileSync(fileName + '.json', 'utf8');

let data = JSON.parse(file);
data = data.map(el => {
  const name = el.name.split('_').join(' ');
  return {
    ...el,
    name
  }
})

fs.writeFile(fileName + '.json', JSON.stringify(data, null, 2), 'utf8', (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Data written to ' + fileName);
  }
});


// scrape(imdbTopActors, 'actors');
// scrape(imdbTopActresses, 'actresses');
// scrape(imdbMostPopular, 'celebrities');
