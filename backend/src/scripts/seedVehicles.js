require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vehicle = require('../models/Vehicle');

const newVehicles = [
  {
    name: "Toyota Prius",
    brand: "Toyota",
    model: "Prius",
    year: 2012,
    type: "Car",
    fuel: "Hybrid",
    transmission: "Automatic",
    seats: 5,
    location: "Phnom Penh",
    images: ["/prius.jpg"],
    description: "The most popular hybrid car in Cambodia, very fuel efficient and perfect for city driving.",
    features: ["Automatic", "Hybrid", "5 Seats", "AC", "Bluetooth"],
    pricing: { hour: 4, day: 25, week: 160, month: 600, year: 6000 },
    available: true,
    rating: 4.7,
    trips: 124
  },
  {
    name: "Lexus RX330",
    brand: "Lexus",
    model: "RX330",
    year: 2005,
    type: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    location: "Phnom Penh",
    images: ["/lexus.jpg"],
    description: "A premium and highly popular SUV for comfortable travel to provinces.",
    features: ["Automatic", "Petrol", "5 Seats", "AC", "Leather Seats", "Sunroof"],
    pricing: { hour: 8, day: 45, week: 280, month: 1100, year: 11000 },
    available: true,
    rating: 4.9,
    trips: 89
  },
  {
    name: "Honda Dream 125",
    brand: "Honda",
    model: "Dream",
    year: 2023,
    type: "Motorcycle",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 2,
    location: "Phnom Penh",
    images: ["/dream.jpg"],
    description: "The classic and most ubiquitous motorcycle in Cambodia. Extremely reliable.",
    features: ["125cc", "Manual/Semi-Auto", "2 Seats", "Kick Start"],
    pricing: { hour: 2, day: 10, week: 60, month: 180, year: 1800 },
    available: true,
    rating: 4.8,
    trips: 312
  },
  {
    name: "Giant Mountain Bike",
    brand: "Giant",
    model: "Trance",
    year: 2022,
    type: "Bike",
    fuel: "N/A",
    transmission: "Manual",
    seats: 1,
    location: "Siem Reap",
    images: ["/giant.jpg"],
    description: "A premium mountain bike perfect for exploring Angkor Wat or rough terrains.",
    features: ["21 Speed", "Gear", "Disc Brake", "Front Suspension"],
    pricing: { hour: 1, day: 8, week: 45, month: 120, year: 1200 },
    available: true,
    rating: 4.7,
    trips: 56
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Vehicle.insertMany(newVehicles);
  console.log('New vehicles added successfully!');
  process.exit(0);
}
seed().catch(console.error);
