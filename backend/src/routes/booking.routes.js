const express = require('express');
const router = express.Router();
const {
  createBooking, getBookings, getBooking, cancelBooking, updateBookingStatus, markBalancePaid, uploadBookingDocuments
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { createBookingRules, updateBookingStatusRules, mongoIdRule } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.post('/', protect, createBookingRules, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, mongoIdRule(), getBooking);
router.patch('/:id/cancel', protect, mongoIdRule(), cancelBooking);
router.patch('/:id/status', protect, requireAdmin, mongoIdRule(), updateBookingStatusRules, updateBookingStatus);
router.patch('/:id/mark-balance-paid', protect, requireAdmin, mongoIdRule(), markBalancePaid);
router.post('/:id/documents', protect, requireAdmin, mongoIdRule(), upload.array('documents', 5), upload.resizeAndSave, uploadBookingDocuments);

module.exports = router;
