const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// GET /api/reports/summary
const getSummary = async (req, res, next) => {
  try {
    const [totalVehicles, totalUsers, totalBookings, revenueResult] = await Promise.all([
      Vehicle.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ totalVehicles, totalUsers, totalBookings, totalRevenue, bookingsByStatus });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/revenue
const getRevenue = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const data = await Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: from } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ revenue: data });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/popular-vehicles
const getPopularVehicles = async (req, res, next) => {
  try {
    const data = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: '$vehicleId', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicle',
        },
      },
      { $unwind: '$vehicle' },
      {
        $project: {
          name: '$vehicle.name',
          brand: '$vehicle.brand',
          type: '$vehicle.type',
          images: '$vehicle.images',
          count: 1,
          revenue: 1,
        },
      },
    ]);

    res.json({ vehicles: data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getRevenue, getPopularVehicles };
