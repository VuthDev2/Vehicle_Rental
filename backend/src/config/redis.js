const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: false, // Don't auto-reconnect; we handle it gracefully
  },
});

let redisAvailable = false;

redisClient.on('error', (err) => {
  if (!redisClient.isOpen) {
    redisAvailable = false;
  }
});

redisClient.on('connect', () => {
  redisAvailable = true;
});

redisClient.on('ready', () => {
  redisAvailable = true;
  console.log('✅ Redis connected successfully');
});

redisClient.on('end', () => {
  redisAvailable = false;
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      redisAvailable = true;
    } catch (err) {
      console.warn('⚠️  Redis unavailable – running without cache/rate-limit store.');
      console.warn('   Install & start Redis: brew install redis && redis-server');
      redisAvailable = false;
    }
  }
};

const isRedisAvailable = () => redisAvailable && redisClient.isOpen;

module.exports = { redisClient, connectRedis, isRedisAvailable };
