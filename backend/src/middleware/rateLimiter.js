const rateLimit = require('express-rate-limit');
const { isRedisAvailable, redisClient } = require('../config/redis');

// Helper to construct a limiter — uses Redis when available, falls back to in-memory
const createLimiter = (options) => {
  const base = {
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
  };

  if (isRedisAvailable()) {
    const { RedisStore } = require('rate-limit-redis');
    base.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
  }

  return rateLimit(base);
};

// General auth routes: register, resend, etc.
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests. Please try again later.' },
});

// Login-specific: tighter to prevent brute-force password attacks.
const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// General API routes.
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests. Please try again later.' },
});

// Tighter limit for OTP verification: 6-digit codes (1M space) must not be brute-forceable.
const verificationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many verification attempts. Please try again later.' },
});

module.exports = { authLimiter, loginLimiter, apiLimiter, verificationLimiter };
