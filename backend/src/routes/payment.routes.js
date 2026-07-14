const express = require('express');
const router = express.Router();
const { createPayment, getPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { createPaymentRules } = require('../middleware/validate');

router.post('/', protect, createPaymentRules, createPayment);
router.get('/', protect, getPayments);

module.exports = router;
