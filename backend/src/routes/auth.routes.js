const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail, resendVerification, forgotPassword, verifyResetOtp, resetPassword, changePassword, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, loginLimiter, verificationLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, verifyEmailRules, resendVerificationRules, forgotPasswordRules, verifyResetOtpRules, resetPasswordRules, changePasswordRules } = require('../middleware/validate');

router.post('/register', authLimiter, registerRules, register);
router.post('/login', loginLimiter, loginRules, login);
router.get('/me', protect, getMe);
router.post('/verify-email', verificationLimiter, verifyEmailRules, verifyEmail);
router.post('/resend-verification', verificationLimiter, resendVerificationRules, resendVerification);
router.post('/forgot-password', verificationLimiter, forgotPasswordRules, forgotPassword);
router.post('/verify-reset-otp', verificationLimiter, verifyResetOtpRules, verifyResetOtp);
router.post('/reset-password', verificationLimiter, resetPasswordRules, resetPassword);
router.post('/change-password', protect, changePasswordRules, changePassword);
router.post('/google', authLimiter, googleLogin);

module.exports = router;

