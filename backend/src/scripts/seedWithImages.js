require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { image_search } = require('duckduckgo-images-api');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vehicle = require('../models/Vehicle');

const bikeModels = [
  "Giant FastRoad E+", "Trek Marlin 7", "Specialized Rockhopper",
  "Giant Talon 2", "Cannondale Trail 5", "Brompton C Line",
  "Trek FX 2", "Merida Big Nine", "Polygon Premier 5", "Scott Aspect 950"
];

const motorModels = [
  "Honda Dream 125", "Honda Scoopy Prestige", "Yamaha PG-1", 
  "Honda Click 125i", "Honda PCX 160", "Honda ADV 160", 
  "Yamaha XMAX 300", "Vespa Primavera 150", "Honda Wave 110i", 
  "Yamaha NMAX 155", "Honda MSX 125", "Suzuki Nex II", 
  "Vespa Sprint 150", "Yamaha Aerox 155", "Honda Super Cub C125"
];

const carModels = [
  "Toyota Prius 2023", "Toyota Alphard Executive Lounge", "Ford Ranger Raptor", 
  "BYD Seal Performance", "BYD Atto 3", "Jeep Wrangler Rubicon", 
  "Toyota Fortuner Legender", "Lexus RX350 F Sport", "Lexus LX600", 
  "Range Rover Autobiography", "Toyota Land Cruiser LC300", "Ford Everest Titanium", 
  "Hyundai Palisade", "Kia Carnival", "Porsche Macan"
];

const explicitMap = {
  "Giant FastRoad E+": "ebike_giant.jpg",
  "Giant Talon 2": "giant.jpg",
  "Honda Dream 125": "dream.jpg",
  "Honda Scoopy Prestige": "real_scoopy_1787625363105.jpg",
  "Yamaha PG-1": "pg1.jpg",
  "Honda Click 125i": "click.jpg",
  "Toyota Prius 2023": "prius.jpg",
  "Toyota Alphard Executive Lounge": "real_alphard_1787625423758.jpg",
  "Ford Ranger Raptor": "real_ranger_1787625382087.jpg",
  "BYD Atto 3": "byd.jpg",
  "Lexus RX350 F Sport": "lexus.jpg"
};

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      // follow redirects if needed, but usually direct
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function getImageForModel(modelName) {
  if (explicitMap[modelName]) {
    return `/${explicitMap[modelName]}`;
  }
  
  const slug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.jpg';
  const publicPath = path.join(__dirname, '../../../../public', slug);
  
  if (fs.existsSync(publicPath)) {
    return `/${slug}`;
  }
  
  console.log(`Downloading image for ${modelName}...`);
  try {
    const results = await image_search({ query: `${modelName} vehicle white background isolated profile`, moderate: true });
    if (results && results.length > 0) {
      for (let i = 0; i < Math.min(5, results.length); i++) {
        try {
          await download(results[i].image, publicPath);
          console.log(`Successfully downloaded ${slug}`);
          return `/${slug}`;
        } catch (e) {
          console.log(`Failed to download ${results[i].image}, trying next...`);
        }
      }
    }
  } catch (err) {
    console.error(`Error searching DuckDuckGo for ${modelName}:`, err.message);
  }
  
  // Fallback if download fails
  return null;
}

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB. Wiping vehicles...');
    await Vehicle.deleteMany({});
    
    const vehiclesToInsert = [];
    
    // Process bikes (10)
    for (let i = 0; i < 10; i++) {
      const modelName = bikeModels[i % bikeModels.length];
      const img = await getImageForModel(modelName) || '/giant.jpg';
      vehiclesToInsert.push({
        name: modelName,
        brand: modelName.split(' ')[0],
        model: modelName.split(' ').slice(1).join(' '),
        year: 2023,
        type: "Bike",
        fuel: "N/A",
        transmission: "Manual",
        seats: 1,
        location: "Phnom Penh",
        images: [img],
        description: `A premium ${modelName} for exploring the city streets of Phnom Penh.`,
        features: ["Lock included", "Helmet included", "Modern Design"],
        pricing: { hour: 1, day: 5, week: 25, month: 80, year: 800 },
        available: true,
        rating: 4.5 + (Math.random() * 0.5),
        trips: Math.floor(Math.random() * 50)
      });
    }

    // Process motors (20)
    for (let i = 0; i < 20; i++) {
      const modelName = motorModels[i % motorModels.length];
      const img = await getImageForModel(modelName) || '/scoopy.jpg';
      vehiclesToInsert.push({
        name: modelName,
        brand: modelName.split(' ')[0],
        model: modelName.split(' ').slice(1).join(' '),
        year: 2023,
        type: "Motorcycle",
        fuel: "Petrol",
        transmission: "Automatic",
        seats: 2,
        location: "Phnom Penh",
        images: [img],
        description: "The most popular and reliable ride in Cambodia.",
        features: ["Automatic", "2 Seats", "Storage", "Modern Engine"],
        pricing: { hour: 2, day: 15, week: 80, month: 200, year: 2000 },
        available: true,
        rating: 4.5 + (Math.random() * 0.5),
        trips: Math.floor(Math.random() * 200)
      });
    }

    // Process cars (20)
    for (let i = 0; i < 20; i++) {
      const modelName = carModels[i % carModels.length];
      const img = await getImageForModel(modelName) || '/camry.jpg';
      vehiclesToInsert.push({
        name: modelName,
        brand: modelName.split(' ')[0],
        model: modelName.split(' ').slice(1).join(' '),
        year: 2023,
        type: "Car",
        fuel: modelName.includes('BYD') ? 'Electric' : (modelName.includes('Prius') ? 'Hybrid' : 'Petrol'),
        transmission: "Automatic",
        seats: modelName.includes('Alphard') || modelName.includes('Carnival') || modelName.includes('Palisade') || modelName.includes('LX600') ? 7 : 5,
        location: "Phnom Penh",
        images: [img],
        description: "A premium, luxury vehicle for business or family travel.",
        features: ["Automatic", "Luxury Interior", "Premium Audio", "AC", "Safety Sensors"],
        pricing: { hour: 10, day: 80, week: 400, month: 1200, year: 12000 },
        available: true,
        rating: 4.7 + (Math.random() * 0.3),
        trips: Math.floor(Math.random() * 100)
      });
    }

    console.log('Inserting real Cambodian models with images...');
    await Vehicle.insertMany(vehiclesToInsert);
    console.log('Seed exact completed successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seed();
