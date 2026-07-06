const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const userRoutes = require('./routes/user.routes');
const reportRoutes = require('./routes/report.routes');
const promotionRoutes = require('./routes/promotion.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS – allow Angular dev server
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4000'],
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static files – uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/promotions', promotionRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found.` }));

// Global error handler
app.use(errorHandler);

module.exports = app;
