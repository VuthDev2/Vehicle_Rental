const mongoose = require('mongoose');
const Vehicle = require('./src/models/Vehicle');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const updates = [
    { name: /BYD Seal/i, type: 'Sedan', images: ['/byd_seal.jpg'] },
    { name: /BYD Atto/i, type: 'SUV', images: ['/byd.jpg'] },
    { name: /Ford Ranger/i, type: 'Truck', images: ['/real_ranger_1787625382087.jpg'] },
    { name: /Alphard/i, type: 'Van', images: ['/real_alphard_1787625423758.jpg'] },
    { name: /Carnival/i, type: 'Van', images: ['/real_alphard_1787625423758.jpg'] },
    { name: /Prius/i, type: 'Sedan', images: ['/prius.jpg'] },
    { name: /RX350|LX600|Fortuner|Range Rover|Land Cruiser|Everest|Palisade|Macan|Wrangler/i, type: 'SUV', images: ['/lexus.jpg'] },
    { name: /Scoopy/i, type: 'Scooter', images: ['/real_scoopy_1787625363105.jpg'] },
    { name: /PCX|ADV|XMAX|Primavera|NMAX|Nex|Sprint|Aerox/i, type: 'Scooter', images: ['/scoopy.jpg'] },
    { name: /Click/i, type: 'Scooter', images: ['/click.jpg'] },
    { name: /Dream|Wave|Cub/i, type: 'Motorcycle', images: ['/dream.jpg'] },
    { name: /PG-1/i, type: 'Motorcycle', images: ['/pg1.jpg'] },
    { name: /MSX/i, type: 'Motorcycle', images: ['/zoomer.jpg'] },
  ];

  for (const update of updates) {
    const result = await Vehicle.updateMany(
      { name: update.name },
      { $set: { type: update.type, images: update.images } }
    );
    console.log(`Updated ${result.modifiedCount} vehicles matching ${update.name}`);
  }

  // Also update everything else that is still 'Car' but could be a Sedan
  await Vehicle.updateMany({ type: 'Car' }, { $set: { type: 'Sedan' } });

  process.exit(0);
});
