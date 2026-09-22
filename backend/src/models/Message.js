const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Performance Indexes
// Fetch messages for a specific conversation
messageSchema.index({ userId: 1, createdAt: 1 });
// Fetch unread messages for admin dashboard
messageSchema.index({ isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
