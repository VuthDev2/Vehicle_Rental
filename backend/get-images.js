const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const vehicles = await db.collection('vehicles').find({}).toArray();
  const sample = vehicles.slice(0, 5).map(v => ({ name: v.name, image: v.images[0] }));
  console.log(JSON.stringify(sample, null, 2));
  process.exit(0);
});
