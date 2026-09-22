const IssueReport = require('../models/IssueReport');
const Booking     = require('../models/Booking');
const { sendEmail, getEmailTemplate } = require('../utils/emailService');

// ─── POST /api/v1/issues ────────────────────────────────────────────────────
// Authenticated user submits a new issue report for one of their bookings.
const createIssue = async (req, res, next) => {
  try {
    const { bookingId, issueType, severity, description } = req.body;
    if (!bookingId || !issueType || !description) {
      return res.status(400).json({ message: 'bookingId, issueType, and description are required.' });
    }

    // Verify the booking belongs to the user and is in a valid state to report issues.
    const booking = await Booking.findById(bookingId)
      .populate('vehicleId', 'name')
      .populate('userId', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const reportableStatuses = ['confirmed', 'active', 'completed', 'pending_verification'];
    if (!reportableStatuses.includes(booking.status)) {
      return res.status(400).json({
        message: `Issues can only be reported for active or completed bookings. Current status: ${booking.status}`,
      });
    }

    // Collect uploaded photo paths (from multer).
    const photos = req.files?.map((f) => `/uploads/${f.filename}`) ?? [];

    const issue = await IssueReport.create({
      bookingId,
      vehicleId: booking.vehicleId._id,
      userId: req.user._id,
      issueType,
      severity: severity || 'medium',
      description,
      photos,
    });

    // For EMERGENCY severity, alert the admin team by email immediately.
    if (issue.severity === 'emergency' && process.env.ADMIN_EMAIL) {
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `🚨 EMERGENCY Issue Reported — ${booking.vehicleId?.name || 'Vehicle'}`,
        html: `
          <h2 style="color:#dc2626;">Emergency Issue Report</h2>
          <p><strong>User:</strong> ${req.user.name} (${req.user.email})</p>
          <p><strong>Vehicle:</strong> ${booking.vehicleId?.name}</p>
          <p><strong>Issue Type:</strong> ${issueType}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><a href="${process.env.FRONTEND_URL}/admin/issues">→ View in Admin Panel</a></p>
        `,
      }).catch(() => {}); // Best-effort — never block the response.
    }

    res.status(201).json({ issue });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/issues ─────────────────────────────────────────────────────
// Admin: all reports (paginated, filterable). User: only their own.
const getIssues = async (req, res, next) => {
  try {
    const { status, severity, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    if (status)   filter.status   = status;
    if (severity) filter.severity = severity;

    const [issues, total] = await Promise.all([
      IssueReport.find(filter)
        .populate('userId',    'name email')
        .populate('vehicleId', 'name images')
        .populate({ path: 'bookingId', select: 'startDate endDate totalPrice' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      IssueReport.countDocuments(filter),
    ]);

    res.json({ issues, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/issues/:id ─────────────────────────────────────────────────
const getIssueById = async (req, res, next) => {
  try {
    const issue = await IssueReport.findById(req.params.id)
      .populate('userId',    'name email')
      .populate('vehicleId', 'name images')
      .populate({ path: 'bookingId', select: 'startDate endDate totalPrice status' });

    if (!issue) return res.status(404).json({ message: 'Issue report not found.' });

    // Users can only view their own reports.
    if (req.user.role !== 'admin' && issue.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ issue });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/issues/:id ───────────────────────────────────────────────
// Admin-only: update the status and optionally add a note. Notifies user by email.
const updateIssue = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const allowedStatuses = ['open', 'in_review', 'resolved', 'closed'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const issue = await IssueReport.findById(req.params.id)
      .populate('userId',    'name email')
      .populate('vehicleId', 'name');

    if (!issue) return res.status(404).json({ message: 'Issue report not found.' });

    if (status)    issue.status    = status;
    if (adminNote !== undefined) issue.adminNote = adminNote;
    await issue.save();

    // Notify the user their report status has been updated.
    if (issue.userId?.email) {
      const statusLabel = {
        open: 'Open',
        in_review: 'In Review',
        resolved: 'Resolved',
        closed: 'Closed',
      }[issue.status] || issue.status;

      sendEmail({
        to: issue.userId.email,
        subject: `Your Issue Report Has Been Updated — ${issue.vehicleId?.name || 'Vehicle'}`,
        html: `
          <h2>Hi ${issue.userId.name},</h2>
          <p>Your issue report for <strong>${issue.vehicleId?.name || 'your rental vehicle'}</strong> has been updated.</p>
          <p><strong>New Status:</strong> ${statusLabel}</p>
          ${adminNote ? `<p><strong>Message from our team:</strong><br>${adminNote}</p>` : ''}
          <p>You can view the full details in your bookings page.</p>
          <p>Thank you for letting us know. We're on it!</p>
        `,
      }).catch(() => {});
    }

    res.json({ issue });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/issues/booking/:bookingId ──────────────────────────────────
// Get all issues for a specific booking (user can only see their own).
const getIssuesByBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).select('userId');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const issues = await IssueReport.find({ bookingId: req.params.bookingId })
      .populate('vehicleId', 'name')
      .sort({ createdAt: -1 });

    res.json({ issues });
  } catch (err) {
    next(err);
  }
};

module.exports = { createIssue, getIssues, getIssueById, updateIssue, getIssuesByBooking };
