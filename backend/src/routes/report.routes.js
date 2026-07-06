const express = require('express');
const router = express.Router();
const { getSummary, getRevenue, getPopularVehicles } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

router.get('/summary', protect, requireAdmin, getSummary);
router.get('/revenue', protect, requireAdmin, getRevenue);
router.get('/popular-vehicles', protect, requireAdmin, getPopularVehicles);

module.exports = router;
