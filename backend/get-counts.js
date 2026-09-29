const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const vehicles = await db.collection('vehicles').find({}).toArray();
  const cars = vehicles.filter(v => ['Car', 'Sedan', 'SUV', 'Van', 'Truck'].includes(v.type)).length;
  const motors = vehicles.filter(v => ['Motorcycle', 'Scooter'].includes(v.type)).length;
  const bikes = vehicles.filter(v => ['Bike', 'E-Bike'].includes(v.type)).length;
  console.log(`Cars: ${cars}, Motors: ${motors}, Bicycles: ${bikes}`);
  process.exit(0);
});
