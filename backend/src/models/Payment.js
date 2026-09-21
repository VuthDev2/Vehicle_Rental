const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount:        { type: Number, required: true, min: 0 },
    method:        { type: String, enum: ['Card', 'PayPal', 'Cash', 'ABA Pay', 'Wing', 'pay_at_store'], required: true },
    status:        { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
    paymentType:   { type: String, enum: ['full', 'deposit', 'balance'], default: 'full' },
    transactionId: { type: String, default: '' },
    notes:         { type: String, default: '' },
  },
  { timestamps: true }
);

// Performance Indexes
// Fetch all payments for a user (payment history)
paymentSchema.index({ userId: 1, createdAt: -1 });
// Fetch payments for a specific booking
paymentSchema.index({ bookingId: 1 });
// Filter by payment status (admin reporting)
paymentSchema.index({ status: 1 });
// Filter by transaction ID (PayWay webhook lookups)
paymentSchema.index({ transactionId: 1 }, { sparse: true });

module.exports = mongoose.model('Payment', paymentSchema);
