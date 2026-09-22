const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/v1/messages
// For customers: gets their own conversation
// For admins: gets all conversations grouped by user
const getMessages = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.query.userId || req.user._id;

    if (isAdmin && !req.query.userId) {
      // Group conversations by user for the admin inbox
      const conversations = await Message.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$userId',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $ne: ['$senderId', req.user._id] }] }, 1, 0]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            'user.name': 1,
            'user.email': 1,
            'user.avatar': 1,
            'user.role': 1,
            'user.phone': 1,
            'user.createdAt': 1,
            lastMessage: 1,
            unreadCount: 1
          }
        },
        { $sort: { 'lastMessage.createdAt': -1 } }
      ]);
      
      return res.json({ conversations });
    }

    // Getting messages for a specific conversation
    if (isAdmin && req.query.userId) {
      // Mark as read
      await Message.updateMany(
        { userId: req.query.userId, senderId: { $ne: req.user._id }, isRead: false },
        { $set: { isRead: true } }
      );
    } else if (!isAdmin) {
      // Mark admin messages as read for customer
      await Message.updateMany(
        { userId: req.user._id, senderId: { $ne: req.user._id }, isRead: false },
        { $set: { isRead: true } }
      );
    }

    const messages = await Message.find({ userId })
      .populate('senderId', 'name avatar role')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/messages
const sendMessage = async (req, res, next) => {
  try {
    const { text, userId } = req.body;
    const senderId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    
    const targetUserId = isAdmin ? userId : req.user._id;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    if (isAdmin && !userId) {
      return res.status(400).json({ message: 'Target userId is required for admins.' });
    }

    const message = await Message.create({
      userId: targetUserId,
      senderId,
      text: text.trim()
    });

    const populatedMessage = await message.populate('senderId', 'name avatar role');

    res.status(201).json({ message: populatedMessage });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMessages,
  sendMessage
};
