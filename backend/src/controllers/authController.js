const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/emailService');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Generate a 6-digit code plus its sha256 hash for storage. */
const generateVerificationCode = () => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  return {
    code,
    hash: crypto.createHash('sha256').update(code).digest('hex'),
  };
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, phone, passwordHash: password });

    // Issue a 6-digit email verification code (non-fatal if email cannot be sent).
    const { code, hash } = generateVerificationCode();
    user.emailVerificationToken = hash;
    user.emailVerificationExpires = Date.now() + VERIFICATION_CODE_TTL_MS;
    await user.save({ validateBeforeSave: false });
    const mailResult = await sendVerificationEmail(user.email, user.name, code);

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user,
      ...(mailResult.sent ? {} : { devCode: code }),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled.' });
    }

    const token = signToken(user._id);
    user.passwordHash = undefined;

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// POST /api/auth/verify-email
const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }
    if (user.emailVerified) {
      return res.json({ message: 'Email already verified.', user });
    }

    const hash = crypto.createHash('sha256').update(String(code)).digest('hex');
    const stored = user.emailVerificationToken;
    if (
      !stored ||
      stored.length !== hash.length ||
      !crypto.timingSafeEqual(Buffer.from(stored, 'hex'), Buffer.from(hash, 'hex'))
    ) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }
    if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: 'Verification code has expired. Please request a new one.' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified successfully.', user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-verification
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (user && !user.emailVerified) {
      const { code, hash } = generateVerificationCode();
      user.emailVerificationToken = hash;
      user.emailVerificationExpires = Date.now() + VERIFICATION_CODE_TTL_MS;
      await user.save({ validateBeforeSave: false });
      const mailResult = await sendVerificationEmail(user.email, user.name, code);

      if (!mailResult.sent) {
        return res.json({ message: 'Verification code sent.', devCode: code });
      }
    }

    // Generic response avoids leaking whether the account exists.
    res.json({ message: 'If that email exists and is unverified, a new code has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetHash;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });

    const result = await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({
      message: 'If that email exists, a reset link has been sent.',
      ...(result.sent ? {} : { notice: 'Email service not configured. Use the reset token directly in development.' }),
      ...(result.sent ? {} : { devToken: resetToken }),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const resetHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.passwordHash = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    user.passwordHash = undefined;

    res.json({ message: 'Password reset successful.', token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.passwordHash = newPassword;
    await user.save();
    user.passwordHash = undefined;

    res.json({ message: 'Password updated successfully.', user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, verifyEmail, resendVerification, forgotPassword, resetPassword, changePassword };
