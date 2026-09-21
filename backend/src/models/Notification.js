const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means it's a notification for Admins
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['booking', 'system', 'promotion'],
      default: 'system',
    },
    link: {
      type: String,
      default: null, // Frontend route to navigate to when clicked
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Performance Indexes
// Fetch all notifications for a user sorted by newest first
notificationSchema.index({ userId: 1, createdAt: -1 });
// Fetch only unread notifications for a user (notification badge count)
notificationSchema.index({ userId: 1, read: 1 });
// Fetch admin-wide notifications (userId: null)
notificationSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
