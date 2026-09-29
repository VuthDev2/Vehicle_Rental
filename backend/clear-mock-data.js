const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

async function clearData() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  console.log("Dropping mock data collections...");
  
  const collections = ['vehicles', 'bookings', 'reviews', 'payments', 'reports', 'promotions', 'messages', 'notifications'];
  
  for (const col of collections) {
    try {
      await db.collection(col).deleteMany({});
      console.log(`Cleared collection: ${col}`);
    } catch (err) {
      console.log(`Failed to clear ${col} or it doesn't exist.`);
    }
  }
  
  console.log("Mock data completely wiped! Ready for real data.");
  process.exit(0);
}

clearData();
