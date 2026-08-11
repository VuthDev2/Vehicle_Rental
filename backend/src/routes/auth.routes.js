const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail, resendVerification, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { verificationLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, verifyEmailRules, resendVerificationRules, forgotPasswordRules, resetPasswordRules, changePasswordRules } = require('../middleware/validate');

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', protect, getMe);
router.post('/verify-email', verificationLimiter, verifyEmailRules, verifyEmail);
router.post('/resend-verification', verificationLimiter, resendVerificationRules, resendVerification);
router.post('/forgot-password', forgotPasswordRules, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, resetPassword);
router.post('/change-password', protect, changePasswordRules, changePassword);

module.exports = router;
