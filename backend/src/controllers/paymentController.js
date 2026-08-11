const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { sendBookingConfirmationEmail } = require('../utils/emailService');
const {
  buildPurchase,
  requestKhqr,
  checkTransaction,
  generateTranId,
} = require('../utils/payway');

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
        .populate({
          path: 'bookingId',
          select: 'rentalType startDate endDate totalPrice vehicleId',
          populate: { path: 'vehicleId', select: 'name' },
        })
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

// Shared: mark a payment (by tran_id) succeeded and confirm its booking.
const markPaid = async (tranId) => {
  const payment = await Payment.findOne({ transactionId: tranId });
  if (!payment) return { payment: null };
  if (payment.status !== 'succeeded') {
    payment.status = 'succeeded';
    await payment.save();
  }

  const booking = await Booking.findByIdAndUpdate(
    payment.bookingId,
    { paymentStatus: 'paid', status: 'confirmed' },
    { new: true }
  )
    .populate('vehicleId')
    .populate('userId', 'name email');

  if (booking?.userId?.email) {
    try {
      await sendBookingConfirmationEmail(booking.userId.email, booking.userId.name, {
        ...booking.toObject(),
        vehicle: booking.vehicleId,
      });
    } catch (e) {
      // Confirmation email is best-effort; never block payment reconciliation.
    }
  }
  return { payment, booking };
};

// POST /api/payments/payway/create  { bookingId }
// Returns the signed fields + action URL the browser posts to ABA PayWay.
const createPaywayForm = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('vehicleId', 'name')
      .populate('userId', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid.' });
    }

    const tranId = generateTranId();

    // Record a pending ABA Pay payment keyed by tran_id so the callback/confirm
    // step can reconcile it later.
    await Payment.findOneAndUpdate(
      { bookingId, status: 'pending' },
      {
        bookingId,
        userId: req.user._id,
        amount: booking.totalPrice,
        method: 'ABA Pay',
        status: 'pending',
        transactionId: tranId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const nameParts = (booking.userId.name || 'Customer').trim().split(/\s+/);
    const firstname = nameParts[0] || 'Customer';
    const lastname = nameParts.slice(1).join(' ') || '-';

    const frontend = process.env.FRONTEND_URL || 'http://localhost:4200';
    const backend = process.env.BACKEND_URL || 'http://localhost:5001';

    const payload = buildPurchase({
      tranId,
      amount: booking.totalPrice,
      items: [
        {
          name: booking.vehicleId?.name || 'Vehicle Rental',
          quantity: 1,
          price: Number(booking.totalPrice),
        },
      ],
      firstname,
      lastname,
      email: booking.userId.email || '',
      phone: booking.userId.phone || '',
      returnUrl: `${backend}/api/payments/payway/callback`,
      continueSuccessUrl: `${frontend}/payment/return?tran_id=${tranId}`,
      cancelUrl: `${frontend}/vehicles/${booking.vehicleId?._id || ''}`,
    });

    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/payway/callback  (server-to-server push from ABA PayWay)
// Public. ABA cannot reach a localhost URL, so this only fires in a deployed
// environment; we re-verify via check-transaction rather than trusting the body.
const paywayCallback = async (req, res) => {
  try {
    const tranId = req.body.tran_id || req.body.tranId;
    if (tranId) {
      const { approved } = await checkTransaction(tranId).catch(() => ({ approved: false }));
      if (approved) await markPaid(tranId);
    }
  } catch (e) {
    // Swallow — always ACK so ABA does not retry indefinitely.
  }
  res.json({ status: 'ok' });
};

// POST /api/payments/payway/confirm  { tranId }
// Called by the success page after the ABA redirect to reconcile the payment.
const confirmPaywayTransaction = async (req, res, next) => {
  try {
    const { tranId } = req.body;
    if (!tranId) return res.status(400).json({ message: 'tranId is required.' });

    const payment = await Payment.findOne({ transactionId: tranId });
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    if (
      payment.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (payment.status === 'succeeded') return res.json({ paid: true });

    const { approved } = await checkTransaction(tranId);
    if (!approved) return res.json({ paid: false });

    await markPaid(tranId);
    res.json({ paid: true });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/payway/qr  { bookingId }
// Returns a KHQR (image + string) for the booking so the app can render it
// in-page. Also records a pending ABA Pay payment keyed by tran_id.
const createPaywayQr = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('vehicleId', 'name')
      .populate('userId', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid.' });
    }

    const tranId = generateTranId();

    await Payment.findOneAndUpdate(
      { bookingId, status: 'pending' },
      {
        bookingId,
        userId: req.user._id,
        amount: booking.totalPrice,
        method: 'ABA Pay',
        status: 'pending',
        transactionId: tranId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const nameParts = (booking.userId.name || 'Customer').trim().split(/\s+/);
    const firstname = nameParts[0] || 'Customer';
    const lastname = nameParts.slice(1).join(' ') || '-';

    const data = await requestKhqr({
      tranId,
      amount: booking.totalPrice,
      items: [
        {
          name: booking.vehicleId?.name || 'Vehicle Rental',
          quantity: 1,
          price: Number(booking.totalPrice),
        },
      ],
      firstname,
      lastname,
      email: booking.userId.email || '',
      phone: booking.userId.phone || '',
    });

    if (!data.qrImage && !data.qrString) {
      return res.status(502).json({
        message: data?.status?.message || 'Could not generate a QR from PayWay.',
      });
    }

    res.json({
      tranId,
      bookingId: booking._id,
      amount: booking.totalPrice,
      qrImage: data.qrImage || '',
      qrString: data.qrString || '',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/payway/mark-paid  { tranId }
// DEMO/manual confirmation — marks the payment paid without a live ABA charge
// (used for testing when no ABA payer simulator is available). In production
// this must be driven by the callback webhook or check-transaction instead.
const markPaywayPaid = async (req, res, next) => {
  try {
    const { tranId } = req.body;
    if (!tranId) return res.status(400).json({ message: 'tranId is required.' });

    const payment = await Payment.findOne({ transactionId: tranId });
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    if (
      payment.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await markPaid(tranId);
    res.json({ paid: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPayment,
  getPayments,
  createPaywayForm,
  createPaywayQr,
  markPaywayPaid,
  paywayCallback,
  confirmPaywayTransaction,
};
