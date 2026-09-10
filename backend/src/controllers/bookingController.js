const bookingService = require('../services/bookingService');

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json({ booking });
  } catch (err) {
    if (
      err.message === 'Vehicle not found.' ||
      err.message === 'Vehicle is not available.' ||
      err.message === 'Vehicle is already booked for the selected period.'
    ) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const data = await bookingService.getBookings(req.user._id, isAdmin, req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
const getBooking = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const booking = await bookingService.getBookingById(req.params.id, req.user._id, isAdmin);
    res.json({ booking });
  } catch (err) {
    if (err.message === 'Booking not found.') return res.status(404).json({ message: err.message });
    if (err.message === 'Access denied.') return res.status(403).json({ message: err.message });
    next(err);
  }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const booking = await bookingService.cancelBooking(req.params.id, req.user._id, isAdmin);
    res.json({ booking });
  } catch (err) {
    if (err.message === 'Booking not found.') return res.status(404).json({ message: err.message });
    if (err.message === 'Access denied.') return res.status(403).json({ message: err.message });
    if (err.message === 'Cannot cancel this booking.') return res.status(400).json({ message: err.message });
    next(err);
  }
};

// PATCH /api/bookings/:id/status (admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatus(req.params.id, req.body.status);
    
    // Broadcast status change
    const io = req.app.get('io');
    if (io) {
      io.emit('booking_status_changed', { 
        bookingId: booking._id, 
        status: booking.status,
        userId: booking.userId
      });
    }

    res.json({ booking });
  } catch (err) {
    if (err.message === 'Booking not found.') return res.status(404).json({ message: err.message });
    next(err);
  }
};

// PATCH /api/bookings/:id/paid (admin)
const markBalancePaid = async (req, res, next) => {
  try {
    const booking = await bookingService.markBalancePaid(req.params.id);
    res.json({ booking });
  } catch (err) {
    if (err.message === 'Booking not found.') return res.status(404).json({ message: err.message });
    if (err.message === 'Booking cannot be marked as paid from this state.') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

module.exports = { 
  createBooking, 
  getBookings, 
  getBooking, 
  cancelBooking, 
  updateBookingStatus, 
  markBalancePaid 
};
