const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const vehiclesCol = db.collection('vehicles');
  
  const vehicles = await vehiclesCol.find({}).toArray();
  let updated = 0;
  
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    
    // For every other vehicle, we'll assign a local image
    if (i % 2 === 0) {
      let localImg = '';
      if (v.type === 'Car') localImg = '/assets/images/car_card.png';
      else if (v.type === 'Motorcycle' || v.type === 'Scooter') localImg = '/assets/images/moto_card.png';
      else if (v.type === 'Bike' || v.type === 'E-Bike') localImg = '/assets/images/bike_card.png';
      else localImg = '/assets/images/car_card.png';
      
      await vehiclesCol.updateOne({ _id: v._id }, { $set: { images: [localImg] } });
      updated++;
    }
  }
  
  console.log(`Assigned local images to ${updated} vehicles. The rest still use Wikipedia URLs.`);
  process.exit(0);
});
