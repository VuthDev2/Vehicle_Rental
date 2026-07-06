const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount:        { type: Number, required: true, min: 0 },
    method:        { type: String, enum: ['Card', 'PayPal', 'Cash', 'ABA Pay', 'Wing'], required: true },
    status:        { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
    transactionId: { type: String, default: '' },
    notes:         { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
