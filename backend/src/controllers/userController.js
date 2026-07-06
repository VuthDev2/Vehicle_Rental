const User = require('../models/User');

// GET /api/users (admin)
const getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.query) {
      filter.$or = [
        { name: { $regex: req.query.query, $options: 'i' } },
        { email: { $regex: req.query.query, $options: 'i' } },
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const allowed = ['name', 'phone', 'avatar'];
    if (req.user.role === 'admin') allowed.push('role', 'isActive');

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id (admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser };
