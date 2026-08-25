const { image_search } = require('duckduckgo-images-api');
const fs = require('fs');
const path = require('path');
const https = require('https');

const vehicles = [
  { name: 'scoopy', query: 'Honda Scoopy white background isolated profile' },
  { name: 'highlander', query: 'Toyota Highlander white background isolated profile' },
  { name: 'ranger', query: 'Ford Ranger white background isolated profile' },
  { name: 'alphard', query: 'Toyota Alphard white background isolated profile' },
  { name: 'tuktuk', query: 'Cambodian Tuk Tuk white background isolated' }
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const v of vehicles) {
    try {
      console.log(`Searching for ${v.query}...`);
      const results = await image_search({ query: v.query, moderate: true });
      if (results && results.length > 0) {
        let downloaded = false;
        for (let i = 0; i < Math.min(5, results.length); i++) {
          try {
            const dest = path.join(__dirname, `../../../../public/${v.name}.jpg`);
            await download(results[i].image, dest);
            console.log(`Successfully downloaded ${v.name}`);
            downloaded = true;
            break;
          } catch (e) {
            console.log(`Failed to download result ${i}, trying next...`);
          }
        }
        if (!downloaded) console.log(`Failed to download any image for ${v.name}`);
      }
    } catch (e) {
      console.error(`Error searching ${v.name}:`, e.message);
    }
  }
}

run();
