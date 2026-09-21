const User = require('../models/User');

// POST /api/auth/send-otp
const sendOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // We always use the phone number provided in the request payload
    // If none provided, fallback to the user's saved phone number
    const targetPhone = req.body.phone || user.phone;
    if (!targetPhone) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user
    user.phone = targetPhone; // Update their phone if it was different
    user.phoneOtpCode = otp;
    user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    // SIMULATED SMS
    console.log(`\n\n========================================`);
    console.log(`📱 SMS TO ${targetPhone}`);
    console.log(`Your Vehicle Rental verification code is: ${otp}`);
    console.log(`========================================\n\n`);

    res.json({ message: 'OTP sent successfully (Simulated).' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'OTP code is required.' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.phoneOtpCode || user.phoneOtpCode !== code) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (user.phoneOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    // Success
    user.phoneVerified = true;
    user.phoneOtpCode = undefined;
    user.phoneOtpExpires = undefined;
    await user.save();

    res.json({ message: 'Phone number verified successfully.', user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendOtp,
  verifyOtp
};
