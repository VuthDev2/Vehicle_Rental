const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

async function fetchImage(query) {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== "-1" && pages[pageId].original) {
      return pages[pageId].original.source;
    }
  } catch (e) {}
  return null;
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const vehiclesCol = db.collection('vehicles');
  
  const vehicles = await vehiclesCol.find({}).toArray();
  
  for (const v of vehicles) {
    console.log(`Fetching image for ${v.name}...`);
    let img = await fetchImage(v.name);
    if (!img) {
      // fallback to brand
      img = await fetchImage(v.brand);
    }
    if (!img) {
      // absolute fallback to generic images
      if (v.type === 'Motorcycle') img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Motorcycle_Suzuki_SV650s.JPG/800px-Motorcycle_Suzuki_SV650s.JPG';
      else if (v.type === 'Bike') img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Left_side_of_Flying_Pigeon.jpg/800px-Left_side_of_Flying_Pigeon.jpg';
      else img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Vintage_car_at_the_Oto_M%C3%A4g_2013.jpg/800px-Vintage_car_at_the_Oto_M%C3%A4g_2013.jpg';
    }
    
    await vehiclesCol.updateOne({ _id: v._id }, { $set: { images: [img] } });
  }
  
  console.log('Updated all images.');
  process.exit(0);
});
