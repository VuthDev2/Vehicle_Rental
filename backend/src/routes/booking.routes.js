const express = require('express');
const router = express.Router();
const {
  createBooking, getBookings, getBooking, cancelBooking, updateBookingStatus,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBooking);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/status', protect, requireAdmin, updateBookingStatus);

module.exports = router;
