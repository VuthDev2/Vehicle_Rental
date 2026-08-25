const fs = require('fs');
const path = require('path');
const https = require('https');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vehicle = require('../models/Vehicle');

const vehicles = [
  { 
    file: 'byd_seal', query: 'BYD Seal car white background isolated',
    data: {
      name: "BYD Seal", brand: "BYD", model: "Seal", year: 2024, type: "Car", fuel: "Electric", transmission: "Automatic", seats: 5, location: "Phnom Penh",
      images: ["/byd_seal.jpg"], description: "A sleek and powerful electric sedan with cutting-edge tech.", features: ["Electric", "Automatic", "AC", "Leather Seats"], pricing: { hour: 8, day: 50, week: 300, month: 1100, year: 0 }, available: true, rating: 4.8, trips: 15
    }
  },
  { 
    file: 'niu_nqi', query: 'NIU NQi electric scooter profile white background isolated',
    data: {
      name: "NIU NQi", brand: "NIU", model: "NQi Sport", year: 2023, type: "Motorcycle", fuel: "Electric", transmission: "Automatic", seats: 2, location: "Phnom Penh",
      images: ["/niu_nqi.jpg"], description: "Smart electric scooter perfect for city commuting.", features: ["Electric", "Automatic", "Smart App"], pricing: { hour: 2, day: 12, week: 70, month: 250, year: 0 }, available: true, rating: 4.7, trips: 80
    }
  },
  {
    file: 'super_soco', query: 'Super Soco TC motorcycle profile white background isolated',
    data: {
      name: "Super Soco TC Max", brand: "Super Soco", model: "TC Max", year: 2023, type: "Motorcycle", fuel: "Electric", transmission: "Automatic", seats: 2, location: "Phnom Penh",
      images: ["/super_soco.jpg"], description: "Café racer style electric motorcycle.", features: ["Electric", "Automatic", "Fast Charge"], pricing: { hour: 3, day: 18, week: 100, month: 380, year: 0 }, available: true, rating: 4.9, trips: 34
    }
  },
  {
    file: 'mg_zsev', query: 'MG ZS EV white background isolated car',
    data: {
      name: "MG ZS EV", brand: "MG", model: "ZS EV", year: 2023, type: "SUV", fuel: "Electric", transmission: "Automatic", seats: 5, location: "Phnom Penh",
      images: ["/mg_zsev.jpg"], description: "Practical and affordable electric family SUV.", features: ["Electric", "Automatic", "AC", "Apple CarPlay"], pricing: { hour: 6, day: 40, week: 240, month: 900, year: 0 }, available: true, rating: 4.6, trips: 25
    }
  },
  {
    file: 'ebike_giant', query: 'Giant FastRoad E+ white background isolated e-bike profile',
    data: {
      name: "Giant FastRoad E+", brand: "Giant", model: "FastRoad E+", year: 2023, type: "E-Bike", fuel: "Electric", transmission: "Manual", seats: 1, location: "Siem Reap",
      images: ["/ebike_giant.jpg"], description: "Premium electric commuter bike.", features: ["Electric", "Manual", "Pedal Assist"], pricing: { hour: 1, day: 10, week: 50, month: 180, year: 0 }, available: true, rating: 4.8, trips: 55
    }
  }
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

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
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
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB.');
  
  for (const v of vehicles) {
    try {
      console.log(`Searching for ${v.query}...`);
      const results = await searchBing(v.query);
      if (results && results.length > 0) {
        let downloaded = false;
        for (let i = 0; i < Math.min(5, results.length); i++) {
          try {
            const dest = path.join(__dirname, `../../../public/${v.file}.jpg`);
            await download(results[i], dest);
            console.log(`Successfully downloaded ${v.file}`);
            downloaded = true;
            break;
          } catch (e) {
            console.log(`Failed to download result ${i}, trying next...`);
          }
        }
        if (!downloaded) {
            console.log(`Failed to download any image for ${v.file}`);
        }
      } else {
          console.log(`No results for ${v.file}`);
      }
      
      // Save to DB
      const existing = await Vehicle.findOne({ name: v.data.name });
      if (!existing) {
          await Vehicle.create(v.data);
          console.log(`Added ${v.data.name} to DB.`);
      } else {
          console.log(`${v.data.name} already in DB.`);
      }
      
    } catch (e) {
      console.error(`Error processing ${v.file}:`, e.message);
    }
  }
  
  console.log('Finished!');
  process.exit(0);
}

run();
