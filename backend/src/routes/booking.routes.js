const express = require('express');
const router = express.Router();
const {
  createBooking, getBookings, getBooking, cancelBooking, updateBookingStatus,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { createBookingRules, updateBookingStatusRules, mongoIdRule } = require('../middleware/validate');

router.post('/', protect, createBookingRules, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, mongoIdRule(), getBooking);
router.patch('/:id/cancel', protect, mongoIdRule(), cancelBooking);
router.patch('/:id/status', protect, requireAdmin, mongoIdRule(), updateBookingStatusRules, updateBookingStatus);

module.exports = router;
