const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// POST /api/payments
const createPayment = async (req, res, next) => {
  try {
    const { bookingId, method } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid.' });
    }

    const transactionId = `CR-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    const payment = await Payment.create({
      bookingId,
      userId: req.user._id,
      amount: booking.totalPrice,
      method,
      status: 'succeeded',
      transactionId,
    });

    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    });

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
