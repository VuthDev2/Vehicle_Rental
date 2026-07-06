const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review completed bookings.' });
    }
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const existing = await Review.findOne({ bookingId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this booking.' });

    const review = await Review.create({
      bookingId,
      vehicleId: booking.vehicleId,
      userId: req.user._id,
      rating,
      comment,
    });

    // Recalculate vehicle average rating
    const reviews = await Review.find({ vehicleId: booking.vehicleId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Vehicle.findByIdAndUpdate(booking.vehicleId, { rating: Math.round(avgRating * 10) / 10 });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews/vehicle/:vehicleId
const getVehicleReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ vehicleId: req.params.vehicleId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id (admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getVehicleReviews, deleteReview };
