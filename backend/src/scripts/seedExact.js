require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vehicle = require('../models/Vehicle');

const bikeMap = [
  { name: "Giant FastRoad E+", image: "/ebike_giant.jpg", priceDay: 8 },
  { name: "Giant Talon 2", image: "/giant.jpg", priceDay: 5 },
  { name: "Trek Marlin 7", image: "/bicycle.jpg", priceDay: 4 }
];

const motorMap = [
  { name: "Honda Dream 125", image: "/dream.jpg", priceDay: 6 },
  { name: "Honda Scoopy Prestige", image: "/scoopy.jpg", priceDay: 8 },
  { name: "Yamaha PG-1", image: "/pg1.jpg", priceDay: 10 },
  { name: "Honda Click 125i", image: "/click.jpg", priceDay: 7 },
  { name: "Honda Zoomer-X", image: "/zoomer.jpg", priceDay: 9 },
  { name: "Honda Scoopy Club12", image: "/real_scoopy_1787625363105.jpg", priceDay: 8 },
  { name: "NIU NQi Sport", image: "/niu_nqi.jpg", priceDay: 11 },
  { name: "Super Soco TC", image: "/super_soco.jpg", priceDay: 12 }
];

const carMap = [
  { name: "Toyota Prius 2023", image: "/prius.jpg", priceDay: 25 },
  { name: "Toyota Camry", image: "/camry.jpg", priceDay: 30 },
  { name: "Toyota Alphard Executive Lounge", image: "/real_alphard_1787625423758.jpg", priceDay: 75 },
  { name: "Ford Ranger Raptor", image: "/real_ranger_1787625382087.jpg", priceDay: 60 },
  { name: "BYD Seal Performance", image: "/byd_seal.jpg", priceDay: 50 },
  { name: "BYD Atto 3", image: "/mg_zsev.jpg", priceDay: 40 },
  { name: "Lexus RX350 F Sport", image: "/lexus.jpg", priceDay: 70 },
  { name: "Tesla Model 3", image: "/tesla.jpg", priceDay: 55 },
  { name: "BYD Tang", image: "/byd.jpg", priceDay: 45 }
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const bikes = Array.from({ length: 10 }).map((_, i) => {
  const model = getRandom(bikeMap);
  return {
    name: model.name,
    brand: model.name.split(' ')[0],
    model: model.name.split(' ').slice(1).join(' '),
    year: 2023,
    type: "Bike",
    fuel: "N/A",
    transmission: "Manual",
    seats: 1,
    location: "Phnom Penh",
    images: [model.image],
    description: "A premium bicycle for exploring the city streets of Phnom Penh.",
    features: ["Lock included", "Helmet included", "Modern Design"],
    pricing: { hour: Math.max(1, Math.round(model.priceDay / 8)), day: model.priceDay, week: model.priceDay * 5, month: model.priceDay * 15, year: model.priceDay * 150 },
    available: true,
    rating: 4.5 + (Math.random() * 0.5),
    trips: Math.floor(Math.random() * 50)
  };
});

const motors = Array.from({ length: 20 }).map((_, i) => {
  const model = getRandom(motorMap);
  return {
    name: model.name,
    brand: model.name.split(' ')[0],
    model: model.name.split(' ').slice(1).join(' '),
    year: 2023,
    type: "Motorcycle",
    fuel: model.name.includes('NIU') || model.name.includes('Soco') ? "Electric" : "Petrol",
    transmission: "Automatic",
    seats: 2,
    location: "Phnom Penh",
    images: [model.image],
    description: "The most popular and reliable ride in Cambodia.",
    features: ["Automatic", "2 Seats", "Storage", "Modern Engine"],
    pricing: { hour: Math.max(1, Math.round(model.priceDay / 8)), day: model.priceDay, week: model.priceDay * 5, month: model.priceDay * 15, year: model.priceDay * 150 },
    available: true,
    rating: 4.5 + (Math.random() * 0.5),
    trips: Math.floor(Math.random() * 200)
  };
});

const cars = Array.from({ length: 20 }).map((_, i) => {
  const model = getRandom(carMap);
  return {
    name: model.name,
    brand: model.name.split(' ')[0],
    model: model.name.split(' ').slice(1).join(' '),
    year: 2023,
    type: "Car",
    fuel: model.name.includes('BYD') || model.name.includes('Tesla') ? 'Electric' : (model.name.includes('Prius') ? 'Hybrid' : 'Petrol'),
    transmission: "Automatic",
    seats: model.name.includes('Alphard') ? 7 : 5,
    location: "Phnom Penh",
    images: [model.image],
    description: "A premium, luxury vehicle for business or family travel.",
    features: ["Automatic", "Luxury Interior", "Premium Audio", "AC", "Safety Sensors"],
    pricing: { hour: Math.max(1, Math.round(model.priceDay / 8)), day: model.priceDay, week: model.priceDay * 5, month: model.priceDay * 15, year: model.priceDay * 150 },
    available: true,
    rating: 4.7 + (Math.random() * 0.3),
    trips: Math.floor(Math.random() * 100)
  };
});

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB. Wiping vehicles...');
    await Vehicle.deleteMany({});
    
    console.log('Inserting real Cambodian models (10 bikes, 20 motors, 20 luxury cars)...');
    await Vehicle.insertMany([...bikes, ...motors, ...cars]);
    console.log('Seed exact completed successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seed();
