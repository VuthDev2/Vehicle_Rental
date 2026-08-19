const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(' MONGO_URI is not set in environment variables.');
    process.exit(1);
  }

  // Set public DNS servers to resolve MongoDB SRV records on networks/systems that fail SRV resolution
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    // Ignore if setServers is restricted
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
