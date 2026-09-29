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
    const vehicles = await Vehicle.find()
      .sort({ trips: -1 })
      .limit(4)
      .select('name brand type images trips');

    const totalTrips = vehicles.reduce((sum, v) => sum + (v.trips || 0), 0) || 1;

    const mapped = vehicles.map(v => ({
      name: v.name,
      brand: v.brand,
      type: v.type,
      images: v.images,
      count: Math.round(((v.trips || 0) / totalTrips) * 100), // Treat count as percentage for the UI
      revenue: 0
    }));

    res.json({ vehicles: mapped });
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

// GET /api/reports/category-revenue
// Returns revenue breakdown grouped by vehicle type/category
const getCategoryRevenue = async (req, res, next) => {
  try {
    // Aggregate bookings → join vehicles → join payments
    const data = await Booking.aggregate([
      // Only include completed or confirmed bookings
      { $match: { status: { $in: ['completed', 'confirmed'] } } },
      // Lookup vehicle info
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicle',
        },
      },
      { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: false } },
      // Lookup payment for this booking
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'bookingId',
          as: 'payments',
        },
      },
      // Sum payment amounts per booking
      {
        $addFields: {
          paidAmount: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$payments',
                    as: 'p',
                    cond: { $eq: ['$$p.status', 'succeeded'] },
                  },
                },
                as: 'p',
                in: '$$p.amount',
              },
            },
          },
          vehicleType: '$vehicle.type',
        },
      },
      // Group by vehicle type
      {
        $group: {
          _id: '$vehicleType',
          totalRevenue: { $sum: '$paidAmount' },
          totalBookings: { $sum: 1 },
          vehicleCount: { $addToSet: '$vehicle._id' },
        },
      },
      {
        $project: {
          category: '$_id',
          totalRevenue: 1,
          totalBookings: 1,
          vehicleCount: { $size: '$vehicleCount' },
          avgRevenuePerBooking: {
            $cond: [
              { $gt: ['$totalBookings', 0] },
              { $round: [{ $divide: ['$totalRevenue', '$totalBookings'] }, 2] },
              0,
            ],
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Calculate grand total for percentage
    const grandTotal = data.reduce((s, d) => s + d.totalRevenue, 0) || 1;
    const result = data.map((d) => ({
      category: d.category || 'Other',
      totalRevenue: Math.round(d.totalRevenue * 100) / 100,
      totalBookings: d.totalBookings,
      vehicleCount: d.vehicleCount,
      avgRevenuePerBooking: Math.round(d.avgRevenuePerBooking * 100) / 100,
      percentage: Math.round((d.totalRevenue / grandTotal) * 1000) / 10,
    }));

    res.json({ categories: result, grandTotal: Math.round(grandTotal * 100) / 100 });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/category-details/:type
// Returns the individual booking transactions for a specific vehicle type
const getCategoryDetails = async (req, res, next) => {
  try {
    const vehicleType = req.params.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find vehicles of this type
    const vehicles = await Vehicle.find({ type: vehicleType }).lean();
    const vehicleIds = vehicles.map((v) => v._id);

    // Find bookings for these vehicles
    const [bookings, total] = await Promise.all([
      Booking.find({ vehicleId: { $in: vehicleIds }, status: { $in: ['completed', 'confirmed', 'pending', 'cancelled'] } })
        .populate('userId', 'name email phone')
        .populate('vehicleId', 'name brand type images pricing')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments({ vehicleId: { $in: vehicleIds } }),
    ]);

    // Attach payments for each booking
    const bookingIds = bookings.map((b) => b._id);
    const payments = await Payment.find({ bookingId: { $in: bookingIds }, status: 'succeeded' }).lean();
    const paymentMap = {};
    payments.forEach((p) => {
      const key = p.bookingId.toString();
      paymentMap[key] = (paymentMap[key] || 0) + p.amount;
    });

    const result = bookings.map((b) => ({
      _id: b._id,
      customer: b.userId ? { name: b.userId.name, email: b.userId.email, phone: b.userId.phone } : { name: 'Unknown', email: '', phone: '' },
      vehicle: b.vehicleId ? { name: b.vehicleId.name, brand: b.vehicleId.brand, type: b.vehicleId.type, image: b.vehicleId.images?.[0] || null } : { name: 'Unknown', brand: '', type: vehicleType, image: null },
      startDate: b.startDate,
      endDate: b.endDate,
      rentalType: b.rentalType,
      durationUnits: b.durationUnits,
      status: b.status,
      paymentStatus: b.paymentStatus,
      totalPrice: b.totalPrice,
      amountPaid: paymentMap[b._id.toString()] || b.amountPaid || 0,
      discount: b.discount || 0,
      createdAt: b.createdAt,
    }));

    res.json({ bookings: result, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/revenue-monthly
// Returns a detailed monthly revenue table with bookings + payments
const getRevenueMonthly = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const [revenueData, bookingData] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'succeeded', createdAt: { $gte: from } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$amount' }, transactions: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: from } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, bookings: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = {};
    revenueData.forEach((d) => { const k = `${d._id.year}-${d._id.month}`; map[k] = { ...map[k], revenue: d.revenue, transactions: d.transactions }; });
    bookingData.forEach((d) => { const k = `${d._id.year}-${d._id.month}`; map[k] = { ...map[k], bookings: d.bookings, completed: d.completed, cancelled: d.cancelled }; });

    const result = Object.entries(map).map(([k, v]) => {
      const [year, month] = k.split('-').map(Number);
      return { year, month, label: `${MONTHS[month - 1]} ${year}`, ...v };
    }).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

    res.json({ months: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/booking-status-details
// Returns bookings filtered by status with customer + vehicle info
const getBookingStatusDetails = async (req, res, next) => {
  try {
    const status = req.query.status || 'completed';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ status })
        .populate('userId', 'name email')
        .populate('vehicleId', 'name brand type images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments({ status }),
    ]);

    const bookingIds = bookings.map((b) => b._id);
    const payments = await Payment.find({ bookingId: { $in: bookingIds }, status: 'succeeded' }).lean();
    const paymentMap = {};
    payments.forEach((p) => { const k = p.bookingId.toString(); paymentMap[k] = (paymentMap[k] || 0) + p.amount; });

    const result = bookings.map((b) => ({
      _id: b._id,
      customer: b.userId ? { name: b.userId.name, email: b.userId.email } : { name: 'Unknown', email: '' },
      vehicle: b.vehicleId ? { name: b.vehicleId.name, brand: b.vehicleId.brand, type: b.vehicleId.type, image: b.vehicleId.images?.[0] || null } : { name: 'Unknown', brand: '', type: '', image: null },
      startDate: b.startDate,
      endDate: b.endDate,
      rentalType: b.rentalType,
      durationUnits: b.durationUnits,
      status: b.status,
      paymentStatus: b.paymentStatus,
      totalPrice: b.totalPrice,
      amountPaid: paymentMap[b._id.toString()] || b.amountPaid || 0,
      createdAt: b.createdAt,
    }));

    res.json({ bookings: result, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};


// ─── OWNER REPORT ENDPOINTS ───────────────────────────────────────────────────

// GET /api/reports/owner-summary
const getOwnerSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear  = new Date(now.getFullYear(), 0, 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      allVehicles,
      allBookings,
      revenueThisMonth,
      revenueThisYear,
      revenuePrevMonth,
      bookingsThisMonth,
      bookingsPrevMonth,
      issueReports,
      reviews,
    ] = await Promise.all([
      Vehicle.find().lean(),
      Booking.find().lean(),
      Payment.aggregate([{ $match: { status: 'succeeded', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'succeeded', createdAt: { $gte: startOfYear } } },  { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'succeeded', createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Booking.countDocuments({ createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } }),
      require('../models/IssueReport').find({ status: { $in: ['open', 'in_review'] } }).countDocuments(),
      require('../models/Review').aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]),
    ]);

    const totalRevMonth = revenueThisMonth[0]?.total || 0;
    const totalRevYear  = revenueThisYear[0]?.total || 0;
    const prevRevMonth  = revenuePrevMonth[0]?.total || 1;

    const activeVehicles   = allVehicles.filter(v => v.available).length;
    const rentedVehicles   = allBookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = allBookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length;
    const totalBookings     = allBookings.length;
    const occupancyRate = allVehicles.length > 0 ? Math.round((rentedVehicles / allVehicles.length) * 100) : 0;
    const revenueGrowth = prevRevMonth > 0 ? Math.round(((totalRevMonth - prevRevMonth) / prevRevMonth) * 100) : 0;
    const bookingGrowth = bookingsPrevMonth > 0 ? Math.round(((bookingsThisMonth - bookingsPrevMonth) / bookingsPrevMonth) * 100) : 0;
    const avgRating = reviews[0]?.avg ? Math.round(reviews[0].avg * 10) / 10 : 0;
    const grossProfit = Math.round(totalRevYear * 0.65); // estimate 35% cost
    const netProfit   = Math.round(totalRevYear * 0.45);

    res.json({
      revenueThisMonth: totalRevMonth,
      revenueThisYear: totalRevYear,
      grossProfit,
      netProfit,
      occupancyRate,
      totalBookings,
      bookingsThisMonth,
      completedBookings,
      cancelledBookings,
      cancellationRate: totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0,
      avgRating,
      reviewCount: reviews[0]?.count || 0,
      activeVehicles,
      totalVehicles: allVehicles.length,
      rentedVehicles,
      pendingIssues: issueReports,
      revenueGrowth,
      bookingGrowth,
    });
  } catch (err) { next(err); }
};

// GET /api/reports/fleet-performance
const getFleetPerformance = async (req, res, next) => {
  try {
    const [vehicles, bookings, payments, issueReports, reviews] = await Promise.all([
      Vehicle.find().lean(),
      Booking.find().lean(),
      Payment.find({ status: 'succeeded' }).lean(),
      require('../models/IssueReport').find().lean(),
      require('../models/Review').find().lean(),
    ]);

    const payByVehicle = {}; // vehicleId -> total paid
    const bookingsByVehicle = {}; // vehicleId -> bookings list
    bookings.forEach(b => {
      const vid = b.vehicleId?.toString();
      if (!bookingsByVehicle[vid]) bookingsByVehicle[vid] = [];
      bookingsByVehicle[vid].push(b);
    });

    const bookingIds = bookings.map(b => b._id.toString());
    payments.forEach(p => {
      // Find booking to get vehicleId
      const bid = p.bookingId?.toString();
      const booking = bookings.find(b => b._id.toString() === bid);
      if (!booking) return;
      const vid = booking.vehicleId?.toString();
      payByVehicle[vid] = (payByVehicle[vid] || 0) + p.amount;
    });

    const issuesByVehicle = {};
    issueReports.forEach(ir => { const vid = ir.vehicleId?.toString(); issuesByVehicle[vid] = (issuesByVehicle[vid] || 0) + 1; });

    const reviewsByVehicle = {};
    reviews.forEach(r => {
      const vid = r.vehicleId?.toString();
      if (!reviewsByVehicle[vid]) reviewsByVehicle[vid] = [];
      reviewsByVehicle[vid].push(r.rating);
    });

    const result = vehicles.map(v => {
      const vid = v._id.toString();
      const vBookings = bookingsByVehicle[vid] || [];
      const completed = vBookings.filter(b => b.status === 'completed').length;
      const cancelled = vBookings.filter(b => b.status === 'cancelled').length;
      const revenue   = payByVehicle[vid] || 0;
      const issues    = issuesByVehicle[vid] || 0;
      const vReviews  = reviewsByVehicle[vid] || [];
      const avgRating = vReviews.length > 0 ? Math.round((vReviews.reduce((s, r) => s + r, 0) / vReviews.length) * 10) / 10 : 0;
      const utilization = vBookings.length > 0 ? Math.min(100, Math.round((completed / Math.max(vBookings.length, 1)) * 100)) : 0;
      return {
        _id: vid,
        name: v.name,
        brand: v.brand,
        type: v.type,
        image: v.images?.[0] || null,
        available: v.available,
        rating: v.rating || avgRating,
        trips: v.trips || vBookings.length,
        totalBookings: vBookings.length,
        completedBookings: completed,
        cancelledBookings: cancelled,
        revenue: Math.round(revenue),
        issues,
        avgRating,
        utilization,
        status: !v.available ? 'maintenance' : vBookings.some(b => b.status === 'confirmed') ? 'rented' : 'available',
      };
    }).sort((a, b) => b.revenue - a.revenue);

    res.json({ vehicles: result });
  } catch (err) { next(err); }
};

// GET /api/reports/booking-analytics
const getBookingAnalytics = async (req, res, next) => {
  try {
    const [bookings, payments] = await Promise.all([
      Booking.find().lean(),
      Payment.find({ status: 'succeeded' }).lean(),
    ]);

    const total = bookings.length || 1;
    const completed  = bookings.filter(b => b.status === 'completed').length;
    const cancelled  = bookings.filter(b => b.status === 'cancelled').length;
    const pending    = bookings.filter(b => ['pending', 'pending_approval'].includes(b.status)).length;
    const active     = bookings.filter(b => b.status === 'confirmed').length;

    // Average duration in days
    const durations = bookings.map(b => {
      if (!b.startDate || !b.endDate) return 0;
      return Math.max(1, Math.round((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24)));
    });
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length * 10) / 10 : 0;

    // Peak days (0=Sun...6=Sat)
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    bookings.forEach(b => { if (b.createdAt) dayCount[new Date(b.createdAt).getDay()]++; });
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const peakDays = dayCount.map((c, i) => ({ day: DAYS[i], count: c }));

    // Rental type distribution
    const rentalTypes = {};
    bookings.forEach(b => { const t = b.rentalType || 'day'; rentalTypes[t] = (rentalTypes[t] || 0) + 1; });

    // Monthly trend (last 12 months)
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthMap = {};
    bookings.forEach(b => {
      if (!b.createdAt) return;
      const d = new Date(b.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthMap[k]) monthMap[k] = { label: MONTHS[d.getMonth()], total: 0, completed: 0, cancelled: 0, revenue: 0 };
      monthMap[k].total++;
      if (b.status === 'completed') monthMap[k].completed++;
      if (b.status === 'cancelled') monthMap[k].cancelled++;
    });
    payments.forEach(p => {
      if (!p.createdAt) return;
      const d = new Date(p.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthMap[k]) monthMap[k].revenue += p.amount;
    });
    const monthlyTrend = Object.values(monthMap).slice(-12);

    res.json({
      total, completed, cancelled, pending, active,
      cancellationRate: Math.round((cancelled / total) * 100),
      completionRate: Math.round((completed / total) * 100),
      avgDuration,
      peakDays,
      rentalTypes: Object.entries(rentalTypes).map(([type, count]) => ({ type, count })),
      monthlyTrend,
    });
  } catch (err) { next(err); }
};

// GET /api/reports/customer-insights
const getCustomerInsights = async (req, res, next) => {
  try {
    const [users, bookings, reviews] = await Promise.all([
      require('../models/User').find({ role: 'customer' }).lean(),
      Booking.find().populate('userId', 'name email').populate('vehicleId', 'name').lean(),
      require('../models/Review').find().populate('userId', 'name').populate('vehicleId', 'name').lean(),
    ]);

    const avgRating = reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

    // Per-customer spending
    const spendingMap = {};
    const bookingCountMap = {};
    bookings.forEach(b => {
      const uid = typeof b.userId === 'object' ? b.userId?._id?.toString() : b.userId?.toString();
      if (!uid) return;
      spendingMap[uid] = (spendingMap[uid] || 0) + (b.totalPrice || 0);
      bookingCountMap[uid] = (bookingCountMap[uid] || 0) + 1;
    });

    // Repeat customers (>1 booking)
    const repeatCount = Object.values(bookingCountMap).filter(c => c > 1).length;
    const repeatRate = users.length > 0 ? Math.round((repeatCount / Math.max(users.length, 1)) * 100) : 0;

    // Top customers
    const topCustomers = users
      .map(u => ({ name: u.name, email: u.email, spending: spendingMap[u._id.toString()] || 0, bookings: bookingCountMap[u._id.toString()] || 0 }))
      .filter(c => c.bookings > 0)
      .sort((a, b) => b.spending - a.spending)
      .slice(0, 10);

    // Recent reviews
    const recentReviews = reviews.slice(-10).reverse().map(r => ({
      customerName: typeof r.userId === 'object' ? r.userId?.name || 'Customer' : 'Customer',
      vehicleName: typeof r.vehicleId === 'object' ? r.vehicleId?.name || 'Vehicle' : 'Vehicle',
      rating: r.rating,
      comment: r.comment || '',
      date: r.createdAt,
    }));

    // Rating distribution
    const ratingDist = [1,2,3,4,5].map(star => ({ star, count: reviews.filter(r => Math.round(r.rating) === star).length }));

    res.json({ avgRating, reviewCount: reviews.length, repeatRate, topCustomers, recentReviews, ratingDist, totalCustomers: users.length });
  } catch (err) { next(err); }
};

// GET /api/reports/revenue-by-vehicle
const getRevenueByVehicle = async (req, res, next) => {
  try {
    const [bookings, payments, vehicles] = await Promise.all([
      Booking.find({ status: { $in: ['completed', 'confirmed'] } }).lean(),
      Payment.find({ status: 'succeeded' }).lean(),
      Vehicle.find().lean(),
    ]);

    const payByBooking = {};
    payments.forEach(p => { const bid = p.bookingId?.toString(); payByBooking[bid] = (payByBooking[bid] || 0) + p.amount; });

    const vehicleRevMap = {};
    const vehicleBookMap = {};
    bookings.forEach(b => {
      const vid = b.vehicleId?.toString();
      const bid = b._id.toString();
      vehicleRevMap[vid]  = (vehicleRevMap[vid] || 0) + (payByBooking[bid] || 0);
      vehicleBookMap[vid] = (vehicleBookMap[vid] || 0) + 1;
    });

    const result = vehicles.map(v => {
      const vid = v._id.toString();
      const revenue = vehicleRevMap[vid] || 0;
      const bookingCount = vehicleBookMap[vid] || 0;
      return {
        _id: vid,
        name: v.name,
        brand: v.brand,
        type: v.type,
        image: v.images?.[0] || null,
        revenue: Math.round(revenue),
        bookings: bookingCount,
        avgPerBooking: bookingCount > 0 ? Math.round(revenue / bookingCount) : 0,
        rating: v.rating || 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    res.json({ vehicles: result });
  } catch (err) { next(err); }
};

// ─── EXPENSE MANAGEMENT (Transaction Ledger) ─────────────────────────────────

const Expense = require('../models/Expense');

// GET /api/reports/expenses?page=1&limit=20&category=Repairs
// Returns paginated list of individual expense entries
const getExpenses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;

    const [expenses, total] = await Promise.all([
      Expense.find(filter).populate('vehicleId', 'name brand type images').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Expense.countDocuments(filter),
    ]);

    // Also return summary by category
    const summary = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 }, color: { $first: '$color' } } },
      { $sort: { total: -1 } },
    ]);
    const grandTotal = summary.reduce((s, c) => s + c.total, 0);

    res.json({
      expenses,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      summary: summary.map(s => ({ category: s._id, total: s.total, count: s.count, color: s.color })),
      grandTotal,
    });
  } catch (err) { next(err); }
};

// POST /api/reports/expenses — add a single expense entry
const addExpense = async (req, res, next) => {
  try {
    const { category, amount, color, description, vehicleId, date } = req.body;
    if (!category || amount == null) return res.status(400).json({ message: 'category and amount are required' });

    const expense = await Expense.create({
      category,
      amount: Number(amount),
      color: color || '#6B7280',
      description: description || '',
      vehicleId: vehicleId || undefined,
      createdBy: req.user?._id,
      ...(date ? { createdAt: new Date(date) } : {}),
    });

    const populated = await Expense.findById(expense._id).populate('vehicleId', 'name brand type images').lean();
    res.status(201).json({ expense: populated });
  } catch (err) { next(err); }
};

// PUT /api/reports/expenses/:id — update an expense entry
const updateExpense = async (req, res, next) => {
  try {
    const { category, amount, color, description, vehicleId, date } = req.body;
    const update = {};
    if (category) update.category = category;
    if (amount != null) update.amount = Number(amount);
    if (color) update.color = color;
    if (description != null) update.description = description;
    if (vehicleId) update.vehicleId = vehicleId;
    if (date) update.createdAt = new Date(date);

    const expense = await Expense.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
      .populate('vehicleId', 'name brand type images').lean();
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ expense });
  } catch (err) { next(err); }
};

// DELETE /api/reports/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const exp = await Expense.findByIdAndDelete(req.params.id);
    if (!exp) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// POST /api/reports/expenses/bulk — bulk upsert (still needed for category quick-edit)
const saveExpenses = async (req, res, next) => {
  try {
    const { expenses } = req.body;
    if (!Array.isArray(expenses)) return res.status(400).json({ message: 'expenses array required' });

    const ops = expenses.map(e => ({
      updateOne: {
        filter: { category: e.category },
        update: { $set: { amount: e.amount || 0, color: e.color || '#6B7280', description: e.description || '', createdBy: req.user?._id } },
        upsert: true,
      },
    }));
    await Expense.bulkWrite(ops);

    const updated = await Expense.find().sort({ category: 1 }).lean();
    const total = updated.reduce((s, e) => s + e.amount, 0);
    res.json({ expenses: updated, total });
  } catch (err) { next(err); }
};

module.exports = { getSummary, getRevenue, getPopularVehicles, getDashboard, getCategoryRevenue, getCategoryDetails, getRevenueMonthly, getBookingStatusDetails, getOwnerSummary, getFleetPerformance, getBookingAnalytics, getCustomerInsights, getRevenueByVehicle, getExpenses, addExpense, updateExpense, saveExpenses, deleteExpense };
