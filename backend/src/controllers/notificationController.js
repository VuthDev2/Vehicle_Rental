const Notification = require('../models/Notification');

// GET /api/notifications
// Gets notifications for the currently logged-in user or admin
const getNotifications = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? { userId: null } : { userId: req.user._id };
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50); // Get recent 50

    const unreadCount = await Notification.countDocuments({ ...filter, read: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
// Mark a specific notification as read
const markAsRead = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id, userId: null } : { _id: req.params.id, userId: req.user._id };
    
    const notification = await Notification.findOneAndUpdate(
      filter,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or unauthorized.' });
    }

    res.json({ notification });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/read-all
// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? { userId: null, read: false } : { userId: req.user._id, read: false };
    
    await Notification.updateMany(filter, { read: true });

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
