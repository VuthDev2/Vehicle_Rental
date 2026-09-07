require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Vehicle = require('./src/models/Vehicle');

const updatePrices = async () => {
  await connectDB();

  const vehicles = await Vehicle.find({});
  let count = 0;

  for (const vehicle of vehicles) {
    let baseHour, baseDay, baseWeek, baseMonth, baseYear;
    
    // Bike < Moto < Car
    if (['Bike', 'E-Bike'].includes(vehicle.type)) {
      // Lowest
      baseHour = 2;
      baseDay = 10;
      baseWeek = 50;
      baseMonth = 150;
      baseYear = 1500;
    } else if (['Motorcycle'].includes(vehicle.type)) {
      // Medium
      baseHour = 5;
      baseDay = 20;
      baseWeek = 100;
      baseMonth = 300;
      baseYear = 3000;
    } else {
      // Highest (Car, SUV, Van, Truck, Tuk-Tuk)
      baseHour = 15;
      baseDay = 50;
      baseWeek = 300;
      baseMonth = 900;
      baseYear = 9000;
    }

    vehicle.pricing = {
      hour: baseHour,
      day: baseDay,
      week: baseWeek,
      month: baseMonth,
      year: baseYear
    };

    await vehicle.save();
    count++;
  }

  console.log(`Updated prices for ${count} vehicles.`);
  mongoose.connection.close();
};

updatePrices().catch(console.error);
