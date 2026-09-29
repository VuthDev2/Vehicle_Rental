const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const vehiclesCol = db.collection('vehicles');
  
  const vehicles = await vehiclesCol.find({}).toArray();
  
  const carImages = ['/camry.jpg', '/prius.jpg', '/lexus.jpg', '/byd.jpg', '/tesla.jpg', '/luxury_suv.jpg', '/mg_zsev.jpg', '/byd_seal.jpg'];
  const motoImages = ['/click.jpg', '/scoopy.jpg', '/dream.jpg', '/pg1.jpg', '/zoomer.jpg', '/super_soco.jpg', '/niu_nqi.jpg'];
  const bikeImages = ['/bicycle.jpg', '/giant.jpg', '/ebike_giant.jpg', '/premium_bicycle.jpg'];
  
  let carIdx = 0;
  let motoIdx = 0;
  let bikeIdx = 0;
  
  let updated = 0;
  
  for (const v of vehicles) {
    let img = '';
    
    if (v.type === 'Car') {
      if (v.name.toLowerCase().includes('tesla')) img = '/tesla.jpg';
      else if (v.name.toLowerCase().includes('camry')) img = '/camry.jpg';
      else {
        img = carImages[carIdx % carImages.length];
        carIdx++;
      }
    } else if (v.type === 'Motorcycle' || v.type === 'Scooter') {
      img = motoImages[motoIdx % motoImages.length];
      motoIdx++;
    } else if (v.type === 'Bike' || v.type === 'E-Bike') {
      img = bikeImages[bikeIdx % bikeImages.length];
      bikeIdx++;
    } else {
      img = '/camry.jpg';
    }
    
    await vehiclesCol.updateOne({ _id: v._id }, { $set: { images: [img] } });
    updated++;
  }
  
  console.log(`Restored old images to ${updated} vehicles.`);
  process.exit(0);
});
