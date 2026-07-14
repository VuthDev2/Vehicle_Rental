const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    
    const uri = process.env.MONGO_URI ||
      'mongodb+srv://krysaravuth25_db_user:vuth123%3F%3F@cluster0.sihb0xt.mongodb.net/cambo_rent?appName=Cluster0&compressors=zlib';

    const conn = await mongoose.connect(uri);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
