require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vehicle = require('../models/Vehicle');

const newVehicles = [
  {
    name: "BYD Atto 3",
    brand: "BYD",
    model: "Atto 3",
    year: 2024,
    type: "SUV",
    fuel: "Electric",
    transmission: "Automatic",
    seats: 5,
    location: "Phnom Penh",
    images: ["/byd.jpg"],
    description: "A wildly popular, modern electric SUV with a premium interior and excellent range.",
    features: ["Electric", "Automatic", "5 Seats", "AC", "Panoramic Sunroof", "360 Camera"],
    pricing: { hour: 6, day: 40, week: 240, month: 900, year: 0 },
    available: true,
    rating: 4.9,
    trips: 45
  },
  {
    name: "Tesla Model 3",
    brand: "Tesla",
    model: "Model 3",
    year: 2023,
    type: "Sedan",
    fuel: "Electric",
    transmission: "Automatic",
    seats: 5,
    location: "Phnom Penh",
    images: ["/tesla.jpg"],
    description: "Experience the future of driving with Autopilot and unmatched electric performance.",
    features: ["Electric", "Automatic", "5 Seats", "AC", "Autopilot", "Glass Roof"],
    pricing: { hour: 10, day: 65, week: 390, month: 1400, year: 0 },
    available: true,
    rating: 5.0,
    trips: 22
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Vehicle.insertMany(newVehicles);
  console.log('EV vehicles added successfully!');
  process.exit(0);
}
seed().catch(console.error);
