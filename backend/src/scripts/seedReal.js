require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vehicle = require('../models/Vehicle');

const newVehicles = [
  {
    name: "Honda Scoopy",
    brand: "Honda",
    model: "Scoopy",
    year: 2022,
    type: "Motorcycle",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 2,
    location: "Phnom Penh",
    images: ["/real_scoopy_1787625363105.jpg"],
    description: "The most commonly used automatic moto in Cambodia.",
    features: ["110cc", "Automatic", "2 Seats", "Storage"],
    pricing: { hour: 2, day: 12, week: 65, month: 200, year: 0 },
    available: true,
    rating: 4.8,
    trips: 154
  },
  {
    name: "Ford Ranger",
    brand: "Ford",
    model: "Ranger",
    year: 2021,
    type: "Truck",
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 5,
    location: "Phnom Penh",
    images: ["/real_ranger_1787625382087.jpg"],
    description: "A very popular and robust truck in Cambodia, perfect for heavy duty tasks.",
    features: ["Diesel", "Automatic", "5 Seats", "AC", "4x4", "Off-Road"],
    pricing: { hour: 10, day: 60, week: 350, month: 1200, year: 0 },
    available: true,
    rating: 4.9,
    trips: 121
  },
  {
    name: "Toyota Alphard",
    brand: "Toyota",
    model: "Alphard",
    year: 2023,
    type: "Van",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 7,
    location: "Phnom Penh",
    images: ["/real_alphard_1787625423758.jpg"],
    description: "The premium choice for business executives and large families in Cambodia.",
    features: ["Petrol", "Automatic", "7 Seats", "AC", "Luxury Seats"],
    pricing: { hour: 15, day: 90, week: 550, month: 1800, year: 0 },
    available: true,
    rating: 5.0,
    trips: 65
  },
  {
    name: "Cambodian Tuk Tuk",
    brand: "Local",
    model: "Tuk Tuk",
    year: 2023,
    type: "Tuk-Tuk",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 4,
    location: "Phnom Penh",
    images: ["/real_tuktuk_1787625401676.jpg"],
    description: "Experience the real Cambodia with an authentic Tuk Tuk.",
    features: ["Open Air", "4 Seats", "Driver Included"],
    pricing: { hour: 5, day: 25, week: 120, month: 400, year: 0 },
    available: true,
    rating: 4.7,
    trips: 980
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Vehicle.insertMany(newVehicles);
  console.log('Real vehicles added successfully!');
  process.exit(0);
}
seed().catch(console.error);
