require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Cambo Rent API running on http://localhost:${PORT}`);
    console.log(`📄 Environment: ${process.env.NODE_ENV}`);
  });
});
