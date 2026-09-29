const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const carModels = [
  "Toyota Camry", "Honda Accord", "Ford Mustang", "Chevrolet Malibu", "Nissan Altima",
  "BMW 3 Series", "Mercedes-Benz C-Class", "Audi A4", "Hyundai Sonata", "Kia K5",
  "Volkswagen Passat", "Subaru Legacy", "Mazda 6", "Lexus ES", "Volvo S60",
  "Tesla Model 3", "Porsche Taycan", "Alfa Romeo Giulia", "Jaguar XE", "Genesis G70"
];

const motorModels = [
  "Honda CBR600RR", "Yamaha YZF-R6", "Kawasaki Ninja ZX-6R", "Suzuki GSX-R600", "Ducati Panigale V2",
  "BMW S1000RR", "Triumph Daytona Moto2 765", "Aprilia RS 660", "KTM 890 Duke R", "MV Agusta F3 800",
  "Harley-Davidson Iron 883", "Indian Scout Bobber", "Royal Enfield Classic 350", "Moto Guzzi V7", "Benelli Leoncino 500",
  "Honda Rebel 500", "Yamaha MT-07", "Kawasaki Z650", "Suzuki SV650", "Husqvarna Svartpilen 401"
];

const bikeModels = [
  "Trek FX 1", "Giant Escape 3", "Specialized Sirrus 1.0", "Cannondale Quick 6", "Scott Sub Cross 50",
  "Merida Speeder 100", "Cube Touring", "Orbea Vector", "Bianchi C-Sport", "Fuji Absolute 2.1"
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const vehiclesCol = db.collection('vehicles');
  const bookingsCol = db.collection('bookings');
  
  // Clear existing vehicles to start fresh
  await vehiclesCol.deleteMany({});
  await bookingsCol.deleteMany({}); // Wipe bookings too to avoid orphans causing crashes in the UI
  
  const vehicles = [];
  
  for (let i = 0; i < carModels.length; i++) {
    const model = carModels[i];
    const brand = model.split(' ')[0];
    const img = `https://loremflickr.com/800/600/car?lock=${i+100}`;
    vehicles.push({
      name: model, brand: brand, model: model.replace(brand, '').trim(), year: 2023,
      type: "Car", fuel: "Petrol", transmission: "Automatic", seats: 5, location: "Phnom Penh",
      images: [img], available: true, rating: 4.5, trips: 10, stockCount: 1, securityDeposit: 200,
      pricing: { hour: 5, day: 40, week: 200, month: 600, year: 5000 },
      features: ["AC", "Bluetooth", "Backup Camera"], createdAt: new Date(), updatedAt: new Date()
    });
  }
  
  for (let i = 0; i < motorModels.length; i++) {
    const model = motorModels[i];
    const brand = model.split(' ')[0];
    const img = `https://loremflickr.com/800/600/motorcycle?lock=${i+200}`;
    vehicles.push({
      name: model, brand: brand, model: model.replace(brand, '').trim(), year: 2022,
      type: "Motorcycle", fuel: "Petrol", transmission: "Manual", seats: 2, location: "Phnom Penh",
      images: [img], available: true, rating: 4.8, trips: 25, stockCount: 1, securityDeposit: 100,
      pricing: { hour: 2, day: 15, week: 80, month: 250, year: 2000 },
      features: ["Helmet Included", "Phone Holder"], createdAt: new Date(), updatedAt: new Date()
    });
  }
  
  for (let i = 0; i < bikeModels.length; i++) {
    const model = bikeModels[i];
    const brand = model.split(' ')[0];
    const img = `https://loremflickr.com/800/600/bicycle?lock=${i+300}`;
    vehicles.push({
      name: model, brand: brand, model: model.replace(brand, '').trim(), year: 2021,
      type: "Bike", fuel: "N/A", transmission: "Manual", seats: 1, location: "Siem Reap",
      images: [img], available: true, rating: 4.2, trips: 5, stockCount: 1, securityDeposit: 20,
      pricing: { hour: 1, day: 5, week: 25, month: 80, year: 500 },
      features: ["Basket", "Lock"], createdAt: new Date(), updatedAt: new Date()
    });
  }
  
  await vehiclesCol.insertMany(vehicles);
  console.log(`Inserted ${vehicles.length} vehicles.`);
  process.exit(0);
});
