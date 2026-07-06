const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Promotion = require('../models/Promotion');
const { calculatePrice } = require('../utils/pricingCalculator');

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate, rentalType, quantity, notes, promoCode } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    if (!vehicle.available) return res.status(400).json({ message: 'Vehicle is not available.' });

    // Check for overlapping bookings
    const overlap = await Booking.findOne({
      vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });
    if (overlap) {
      return res.status(400).json({ message: 'Vehicle is already booked for the selected period.' });
    }

    let totalPrice = calculatePrice(vehicle.pricing, rentalType, quantity);
    let discount = 0;

    if (promoCode) {
      const promo = await Promotion.findOne({ code: promoCode.toUpperCase(), active: true });
      if (promo) {
        const now = new Date();
        if (!promo.expiresAt || promo.expiresAt > now) {
          if (totalPrice >= promo.minAmount) {
            discount = promo.discountType === 'percent'
              ? (totalPrice * promo.value) / 100
              : promo.value;
            discount = Math.min(discount, totalPrice);
            await Promotion.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
          }
        }
      }
    }

    const booking = await Booking.create({
      userId: req.user._id,
      vehicleId,
      startDate,
      endDate,
      rentalType,
      quantity,
      totalPrice: totalPrice - discount,
      discount,
      notes: notes || '',
      promoCode: promoCode || '',
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin ? {} : { userId: req.user._id };

    if (req.query.status) filter.status = req.query.status;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('userId', 'name email phone')
        .populate('vehicleId', 'name brand images pricing')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('vehicleId');

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/status (admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getBookings, getBooking, cancelBooking, updateBookingStatus };
