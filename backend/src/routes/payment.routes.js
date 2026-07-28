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
const { createPaymentRules } = require('../middleware/validate');

// ABA PayWay
router.post('/payway/qr', protect, createPaywayQr);
router.post('/payway/mark-paid', protect, markPaywayPaid);
router.post('/payway/create', protect, createPaywayForm);
router.post('/payway/confirm', protect, confirmPaywayTransaction);
router.post('/payway/callback', paywayCallback); // public: server-to-server push from ABA

router.post('/', protect, createPaymentRules, createPayment);
router.get('/', protect, getPayments);

module.exports = router;
