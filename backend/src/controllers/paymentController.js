const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { sendBookingConfirmationEmail } = require('../utils/emailService');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const generateTransactionId = () =>
  `CR-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

// POST /api/payments
const createPayment = async (req, res, next) => {
  try {
    const { bookingId, method } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('vehicleId', 'name images')
      .populate('userId', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid.' });
    }

    let status = 'pending';
    let transactionId = '';

    if (stripe && method === 'Card') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100),
        currency: 'usd',
        metadata: { bookingId: booking._id.toString() },
        description: `Cambo Rent - ${booking.vehicleId?.name || 'Vehicle'} rental`,
      });
      status = 'succeeded';
      transactionId = paymentIntent.id;
    } else if (stripe && method !== 'Cash') {
      // Simulate other electronic methods
      status = 'succeeded';
      transactionId = generateTransactionId();
    } else {
      // Cash or no Stripe key: mock mode
      status = 'succeeded';
      transactionId = generateTransactionId();
    }

    const payment = await Payment.create({
      bookingId,
      userId: req.user._id,
      amount: booking.totalPrice,
      method,
      status,
      transactionId,
    });

    if (status === 'succeeded') {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });

      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';

      const user = booking.userId;
      const vehicle = booking.vehicleId;
      await sendBookingConfirmationEmail(
        user.email,
        user.name,
        { ...booking.toObject(), vehicle }
      );
    }

    res.status(201).json({ payment });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments (admin: all | customer: own)
const getPayments = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('bookingId', 'rentalType startDate endDate totalPrice')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    res.json({ payments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, getPayments };
