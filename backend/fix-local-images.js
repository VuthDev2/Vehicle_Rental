const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const vehiclesCol = db.collection('vehicles');
  
  const vehicles = await vehiclesCol.find({ "images.0": { $regex: "^/assets/images" } }).toArray();
  let updated = 0;
  
  for (const v of vehicles) {
    const fixedImage = v.images[0].replace('/assets/images/', '/images/');
    await vehiclesCol.updateOne({ _id: v._id }, { $set: { images: [fixedImage] } });
    updated++;
  }
  
  console.log(`Fixed paths for ${updated} local images.`);
  process.exit(0);
});
