require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { connectRedis, redisClient } = require('./config/redis');

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

let server;

connectDB().then(async () => {
  // Redis is optional — app starts even without it
  await connectRedis();

  const app = require('./app');
  const { Server } = require('socket.io');
  const startCronJobs = require('./utils/cronJobs');
  
  // Start the background cron jobs
  startCronJobs();
  
  server = app.listen(PORT, () => {
    console.log(`🚀 Cambo Rent API running on http://localhost:${PORT}`);
    console.log(`📄 Environment: ${process.env.NODE_ENV}`);
  });

  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:4200', 'http://localhost:4000', 'https://rental-vehicles.netlify.app'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected from Socket: ${socket.id}`);
    });
  });

  const gracefulShutdown = async () => {
    console.log('Shutdown signal received. Shutting down gracefully...');
    server.close(async () => {
      console.log('💥 HTTP server closed.');
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed.');
      }
      if (redisClient.isOpen) {
        await redisClient.quit();
        console.log('Redis connection closed.');
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
