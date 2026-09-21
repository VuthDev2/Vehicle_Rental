const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, default: '' },
  },
  { timestamps: true }
);

// Performance Indexes
// Fetch all reviews for a vehicle (vehicle detail page)
reviewSchema.index({ vehicleId: 1, createdAt: -1 });
// Fetch all reviews by a user (user profile page)
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
