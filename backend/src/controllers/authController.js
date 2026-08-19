const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    if (!email || !email.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only @gmail.com emails are allowed to register.' });
    }

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

    if (!email || !email.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only @gmail.com emails are allowed to login.' });
    }

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

    const { code, hash } = generateVerificationCode();

    user.resetPasswordToken = hash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });

    const result = await sendPasswordResetEmail(user.email, user.name, code);

    res.json({
      message: 'If that email exists, a reset code has been sent.',
      ...(result.sent ? {} : { notice: 'Email service not configured. Use the reset code directly in development.' }),
      ...(result.sent ? {} : { devToken: code }),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-reset-otp
const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const resetHash = crypto.createHash('sha256').update(String(otp)).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: resetHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    res.json({ message: 'OTP verified successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    const resetHash = crypto.createHash('sha256').update(String(otp)).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: resetHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
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

// POST /api/auth/google
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Google ID token is required.' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token payload.' });
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email || !email.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only @gmail.com emails are allowed.' });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (user.authProvider !== 'google') {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.emailVerified = true;
        if (!user.avatar && picture) user.avatar = picture;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        emailVerified: true,
        avatar: picture || '',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled.' });
    }

    const token = signToken(user._id);

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, verifyEmail, resendVerification, forgotPassword, verifyResetOtp, resetPassword, changePassword, googleLogin };
