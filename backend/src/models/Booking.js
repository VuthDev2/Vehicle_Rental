const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    startDate:     { type: Date, required: true },
    endDate:       { type: Date, required: true },
    rentalType:    { type: String, enum: ['hour', 'day', 'week', 'month', 'year'], required: true },
    quantity:      { type: Number, required: true, min: 1 },
    totalPrice:    { type: Number, required: true, min: 0 },
    status:        { type: String, enum: ['pending', 'pending_approval', 'pending_verification', 'confirmed', 'active', 'cancelled', 'completed'], default: 'pending' },
    paymentMethod: { type: String, enum: ['online', 'pay_at_store'], default: 'online' },
    paymentStatus: { type: String, enum: ['unpaid', 'partially_paid', 'paid', 'refunded'], default: 'unpaid' },
    paymentType:   { type: String, enum: ['full', 'deposit'], default: 'full' },
    amountPaid:    { type: Number, default: 0 },
    balanceDue:    { type: Number, default: 0 },
    notes:         { type: String, default: '' },
    promoCode:     { type: String, default: '' },
    discount:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
