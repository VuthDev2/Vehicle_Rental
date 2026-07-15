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

// GET /api/reports/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalVehicles, totalUsers, totalBookings, revenueResult,
      bookingsByStatus, vehicles, bookings, payments,
    ] = await Promise.all([
      Vehicle.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Vehicle.find().lean(),
      Booking.find().lean(),
      Payment.find({ status: 'succeeded' }).lean(),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const activeRentals = bookings.filter((b) => b.status === 'confirmed').length;

    // Fleet utilization
    const typeMap = {};
    vehicles.forEach((v) => {
      const t = v.type || 'Other';
      if (!typeMap[t]) typeMap[t] = { total: 0, booked: 0 };
      typeMap[t].total++;
    });
    bookings.filter((b) => ['confirmed', 'completed'].includes(b.status)).forEach((b) => {
      const vid = b.vehicleId?.toString();
      const v = vehicles.find((ve) => ve._id.toString() === vid);
      const t = v?.type || 'Other';
      if (typeMap[t]) typeMap[t].booked++;
    });
    const types = ['SUV', 'Sedan', 'Motorbike', 'Van', 'Truck'];
    const fleetUtilization = types.map((t) => {
      const info = typeMap[t] || { total: 0, booked: 0 };
      return { type: t, percent: info.total > 0 ? Math.round((info.booked / info.total) * 100) : 0, total: info.total };
    });

    // Revenue breakdown
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const todayRev = payments.filter((p) => new Date(p.createdAt) >= startOfDay).reduce((s, p) => s + p.amount, 0);
    const weekRev = payments.filter((p) => new Date(p.createdAt) >= startOfWeek).reduce((s, p) => s + p.amount, 0);
    const monthRev = payments.filter((p) => new Date(p.createdAt) >= startOfMonth).reduce((s, p) => s + p.amount, 0);
    const yearRev = payments.filter((p) => new Date(p.createdAt) >= startOfYear).reduce((s, p) => s + p.amount, 0);

    // Customer segments
    const activeCustomerIds = new Set(bookings.map((b) => (b.userId?.toString ? b.userId.toString() : b.userId)));
    const returning = activeCustomerIds.size;
    const totalCust = totalUsers || 1;
    const customerSegments = [
      { label: 'New Customers', value: Math.round(totalCust * 0.15), percent: 15 },
      { label: 'Returning', value: returning, percent: Math.round((returning / totalCust) * 100) },
      { label: 'VIP', value: Math.round(totalCust * 0.08), percent: 8 },
      { label: 'Inactive', value: Math.max(0, totalCust - returning), percent: Math.round(((totalCust - returning) / totalCust) * 100) },
    ];

    // Payment methods
    const paymentMethods = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const grandTotal = paymentMethods.reduce((s, d) => s + d.total, 0);

    res.json({
      summary: { totalVehicles, totalUsers: totalUsers, totalBookings, totalRevenue, bookingsByStatus },
      kpi: { activeRentals, avgBooking: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0 },
      revenueBreakdown: { today: todayRev, thisWeek: weekRev, thisMonth: monthRev, thisYear: yearRev, total: totalRevenue },
      fleetUtilization: { fleet: fleetUtilization, overallPercent: Math.round(fleetUtilization.reduce((s, f) => s + f.percent, 0) / Math.max(fleetUtilization.length, 1)) },
      customerSegments,
      paymentMethods: paymentMethods.map((d) => ({ method: d._id, total: d.total, count: d.count, percentage: grandTotal > 0 ? Math.round((d.total / grandTotal) * 100) : 0 })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getRevenue, getPopularVehicles, getDashboard };
