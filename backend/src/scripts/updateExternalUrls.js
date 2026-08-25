const mongoose = require('mongoose');
const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vehicle = require('../models/Vehicle');

const vehicles = [
  { name: 'BYD Seal', query: 'BYD Seal car white background isolated' },
  { name: 'NIU NQi', query: 'NIU NQi electric scooter profile white background isolated' },
  { name: 'Super Soco TC Max', query: 'Super Soco TC motorcycle profile white background isolated' },
  { name: 'MG ZS EV', query: 'MG ZS EV white background isolated car' },
  { name: 'Giant FastRoad E+', query: 'Giant FastRoad E+ white background isolated e-bike profile' }
];

function searchBing(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const matches = data.match(/murl&quot;:&quot;(https:\/\/.*?)&quot;/g);
        if (matches && matches.length > 0) {
            resolve(matches.map(m => m.replace('murl&quot;:&quot;', '').replace('&quot;', '')));
        } else {
            resolve([]);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const v of vehicles) {
    const results = await searchBing(v.query);
    if (results && results.length > 0) {
      await Vehicle.updateOne({ name: v.name }, { images: [results[0]] });
      console.log(`Updated ${v.name} to use external URL: ${results[0]}`);
    }
  }
  process.exit(0);
}
run();
