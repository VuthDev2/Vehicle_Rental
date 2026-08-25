const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vehicle = require('../models/Vehicle');
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await Vehicle.updateOne({ name: 'BYD Seal' }, { images: ['/byd_seal.png'] });
  await Vehicle.updateOne({ name: 'NIU NQi' }, { images: ['/niu_nqi.png'] });
  await Vehicle.updateOne({ name: 'MG ZS EV' }, { images: ['/mg_zsev.png'] });
  console.log("Updated paths in DB.");
  process.exit(0);
}
run();
