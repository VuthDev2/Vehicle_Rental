const mongoose = require('mongoose');

/**
 * IssueReport — a user-filed incident report tied to an active or completed booking.
 * Links: booking → vehicle → user.
 */
const issueReportSchema = new mongoose.Schema(
  {
    bookingId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking',  required: true },
    vehicleId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle',  required: true },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },

    issueType: {
      type: String,
      enum: ['breakdown', 'accident', 'flat_tire', 'mechanical', 'damage', 'other'],
      required: true,
    },

    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      required: true,
      default: 'medium',
    },

    description: { type: String, required: true, maxlength: 2000 },

    // Uploaded evidence photos (array of URL paths)
    photos: [{ type: String }],

    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'closed'],
      default: 'open',
    },

    // Admin response note (written by admin when updating status)
    adminNote: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true }
);

// Query reports for a booking
issueReportSchema.index({ bookingId: 1 });
// Query all reports for a user
issueReportSchema.index({ userId: 1, createdAt: -1 });
// Admin: filter by status & severity
issueReportSchema.index({ status: 1, severity: 1, createdAt: -1 });

module.exports = mongoose.model('IssueReport', issueReportSchema);
