require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vehicle = require('../models/Vehicle');

const newVehicles = [
  {
    name: "Yamaha PG-1",
    brand: "Yamaha",
    model: "PG-1",
    year: 2024,
    type: "Motorcycle",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 2,
    location: "Phnom Penh",
    images: ["/pg1.jpg"],
    description: "The rugged, adventure-ready Yamaha PG-1.",
    features: ["114cc", "Manual", "Off-road capable"],
    pricing: { hour: 3, day: 15, week: 80, month: 250, year: 0 },
    available: true,
    rating: 4.9,
    trips: 45
  },
  {
    name: "Honda Zoomer-X",
    brand: "Honda",
    model: "Zoomer-X",
    year: 2021,
    type: "Motorcycle",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 2,
    location: "Phnom Penh",
    images: ["/zoomer.jpg"],
    description: "The stylish and unique naked scooter.",
    features: ["110cc", "Automatic", "Under-seat storage"],
    pricing: { hour: 2, day: 14, week: 75, month: 220, year: 0 },
    available: true,
    rating: 4.6,
    trips: 210
  },
  {
    name: "Honda Click 160",
    brand: "Honda",
    model: "Click",
    year: 2023,
    type: "Motorcycle",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 2,
    location: "Phnom Penh",
    images: ["/click.jpg"],
    description: "Sporty and powerful automatic scooter.",
    features: ["160cc", "Automatic", "Smart Key"],
    pricing: { hour: 3, day: 16, week: 90, month: 280, year: 0 },
    available: true,
    rating: 4.8,
    trips: 130
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Vehicle.insertMany(newVehicles);
  console.log('More motos added successfully!');
  process.exit(0);
}
seed().catch(console.error);
