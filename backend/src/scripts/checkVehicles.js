const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });
const Vehicle = require('../models/Vehicle');
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const v = await Vehicle.findOne({ name: "BYD Seal" });
  console.log(v);
  process.exit(0);
}
run();
