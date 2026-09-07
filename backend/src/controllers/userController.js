const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Escape user-supplied strings before using them in a MongoDB $regex to prevent ReDoS.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/users (admin)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, isActive } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password is required and must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = await User.create({
      name,
      email,
      phone: phone || '',
      passwordHash: password,
      role: role || 'customer',
      isActive: isActive !== undefined ? isActive : true,
    });

    if (req.user && req.user.role === 'admin') {
      await ActivityLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'Create User',
        resource: 'User',
        resourceId: user._id,
        details: `Created user ${user.email}`,
        ip: req.ip
      });
    }

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// GET /api/users (admin)
const getUsers = async (req, res, next) => {
  try {
    // Default to excluding admins so they don't show up in the customer management list
    const filter = { role: { $ne: 'admin' } };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.query) {
      const safe = escapeRegex(req.query.query);
      filter.$or = [
        { name: { $regex: safe, $options: 'i' } },
        { email: { $regex: safe, $options: 'i' } },
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

    if (req.user.role === 'admin') {
      await ActivityLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'Update User',
        resource: 'User',
        resourceId: user._id,
        details: `Updated fields: ${Object.keys(updates).join(', ')}`,
        ip: req.ip
      });
    }

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

    await ActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'Delete User',
      resource: 'User',
      resourceId: user._id,
      details: `Deleted user ${user.email}`,
      ip: req.ip
    });

    res.json({ message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/upload-id
const uploadIdDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Assuming the file path from multer/resizeAndSave is something like 'uploads/filename.jpg'
    // The path stored in DB should be relative or a full URL depending on static file serving setup.
    // Given the upload middleware uses `dest: '../../uploads'`, let's store the filename.
    const relativePath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { idDocumentUrl: relativePath, idVerified: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ message: 'ID Document uploaded successfully.', user });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, getUsers, getUser, updateUser, deleteUser, uploadIdDocument };
