const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  
  const admin = await db.collection('users').findOne({ role: 'admin' });
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  const booking = await db.collection('bookings').findOne({});
  const bookingId = booking._id.toString();
  
  console.log(token);
  console.log(bookingId);
  process.exit(0);
}
test();
