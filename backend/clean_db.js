require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./src/models/Vehicle');
const Booking = require('./src/models/Booking');
const Payment = require('./src/models/Payment');
const ActivityLog = require('./src/models/ActivityLog');
const Review = require('./src/models/Review');

async function clean() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB. Wiping old mock data...');
    
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await ActivityLog.deleteMany({});
    await Review.deleteMany({});
    
    console.log('Mock data removed successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
clean();
