const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Promotion = require('../models/Promotion');
const Notification = require('../models/Notification');
const { calculatePrice } = require('../utils/pricingCalculator');

class BookingService {
  async createBooking(userId, data) {
    const { vehicleId, startDate, endDate, rentalType, quantity, notes, promoCode, paymentMethod } = data;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found.');
    if (!vehicle.available) throw new Error('Vehicle is not available.');

    // Check for overlapping bookings
    const overlap = await Booking.findOne({
      vehicleId,
      status: { $in: ['pending', 'pending_verification', 'confirmed'] },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });
    if (overlap) {
      throw new Error('Vehicle is already booked for the selected period.');
    }

    let totalPrice = calculatePrice(vehicle.pricing, rentalType, quantity);
    let discount = 0;

    if (promoCode) {
      const promo = await Promotion.findOne({ code: promoCode.toUpperCase(), active: true });
      if (promo) {
        const now = new Date();
        let isValidPromo = true;

        if (promo.validFrom && promo.validFrom > now) isValidPromo = false;
        if (promo.expiresAt && promo.expiresAt < now) isValidPromo = false;
        if (promo.maxUses && promo.usedCount >= promo.maxUses) isValidPromo = false;
        if (totalPrice < promo.minAmount) isValidPromo = false;

        // Calculate rental days
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const timeDiff = Math.abs(endDateObj.getTime() - startDateObj.getTime());
        const rentalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;

        if (promo.minDays > 1 && rentalDays < promo.minDays) isValidPromo = false;

        if (promo.isForNewUsersOnly) {
          const pastBookingsCount = await Booking.countDocuments({
            userId,
            status: { $nin: ['cancelled'] }
          });
          if (pastBookingsCount > 0) isValidPromo = false;
        }

        if (isValidPromo) {
          discount = promo.discountType === 'percent'
            ? (totalPrice * promo.value) / 100
            : promo.value;
          discount = Math.min(discount, totalPrice);
          await Promotion.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
        }
      }
    }

    const isPayAtStore = paymentMethod === 'pay_at_store';
    const initialStatus = isPayAtStore ? 'pending_verification' : 'pending';

    const booking = await Booking.create({
      userId,
      vehicleId,
      startDate,
      endDate,
      rentalType,
      quantity,
      totalPrice: totalPrice - discount,
      discount,
      notes: notes || '',
      promoCode: promoCode || '',
      paymentMethod: paymentMethod || 'online',
      status: initialStatus,
    });

    await Notification.create({
      userId: null, // Admin
      title: 'New Booking',
      message: `A new booking has been placed for ${vehicle.brand} ${vehicle.model}.`,
      type: 'booking',
      link: '/admin/bookings'
    });

    return booking;
  }

  async getBookings(userId, isAdmin, query) {
    const filter = isAdmin ? {} : { userId };
    if (query.status) filter.status = query.status;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('userId', 'name email phone idVerified')
        .populate('vehicleId', 'name brand images pricing')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return { bookings, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getBookingById(id, userId, isAdmin) {
    const booking = await Booking.findById(id)
      .populate('userId', 'name email phone idVerified')
      .populate('vehicleId');

    if (!booking) throw new Error('Booking not found.');

    if (!isAdmin && booking.userId._id.toString() !== userId.toString()) {
      throw new Error('Access denied.');
    }

    return booking;
  }

  async cancelBooking(id, userId, isAdmin) {
    const booking = await Booking.findById(id);
    if (!booking) throw new Error('Booking not found.');

    if (!isAdmin && booking.userId.toString() !== userId.toString()) {
      throw new Error('Access denied.');
    }

    if (!['pending', 'pending_verification', 'confirmed'].includes(booking.status)) {
      throw new Error('Cannot cancel this booking.');
    }

    booking.status = 'cancelled';
    await booking.save();

    // If the booking was currently active, make the vehicle available again
    await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: true });

    if (isAdmin) {
      await Notification.create({
        userId: booking.userId,
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled by an administrator.',
        type: 'booking',
        link: '/customer/bookings'
      });
    } else {
      await Notification.create({
        userId: null,
        title: 'Booking Cancelled',
        message: 'A customer has cancelled their booking.',
        type: 'booking',
        link: '/admin/bookings'
      });
    }

    return booking;
  }

  async updateBookingStatus(id, status) {
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) throw new Error('Booking not found.');

    // Update vehicle availability if the admin changes status manually
    if (status === 'confirmed' || status === 'active') {
      const now = new Date();
      if (booking.startDate <= now && booking.endDate > now) {
        await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: false });
      }
    } else if (status === 'completed' || status === 'cancelled') {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: true });
    }

    await Notification.create({
      userId: booking.userId,
      title: 'Booking Status Updated',
      message: `Your booking status is now: ${status.replace('_', ' ')}.`,
      type: 'booking',
      link: '/customer/bookings'
    });

    return booking;
  }

  async markBalancePaid(id) {
    const booking = await Booking.findById(id);
    if (!booking) throw new Error('Booking not found.');
    if (booking.paymentStatus !== 'partially_paid' && booking.paymentStatus !== 'unpaid') {
      throw new Error('Booking cannot be marked as paid from this state.');
    }

    booking.amountPaid = booking.totalPrice;
    booking.balanceDue = 0;
    booking.paymentStatus = 'paid';
    await booking.save();

    return booking;
  }
}

module.exports = new BookingService();
