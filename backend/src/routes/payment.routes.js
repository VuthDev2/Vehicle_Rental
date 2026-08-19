const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  createPaywayForm,
  createPaywayQr,
  markPaywayPaid,
  paywayCallback,
  confirmPaywayTransaction,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { createPaymentRules } = require('../middleware/validate');

// ABA PayWay
router.post('/payway/qr', protect, createPaywayQr);
router.post('/payway/create', protect, createPaywayForm);
router.post('/payway/confirm', protect, confirmPaywayTransaction);
router.post('/payway/callback', paywayCallback); // public: server-to-server push from ABA

// markPaywayPaid is a manual/admin override only — never expose to regular users
// as it bypasses actual payment verification entirely.
router.post('/payway/mark-paid', protect, requireAdmin, markPaywayPaid);

router.post('/', protect, createPaymentRules, createPayment);
router.get('/', protect, getPayments);

module.exports = router;

