const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const userCount = await db.collection('users').countDocuments();
  console.log(`Users count: ${userCount}`);
  process.exit(0);
}
check();
