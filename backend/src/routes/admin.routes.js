const express = require('express');
const router = express.Router();
const {
  getActivityLog,
  setMaintenanceMode,
  getHealth,
  getFleetUtilization,
  getCustomerSegments,
  getRevenueBreakdown,
  getPaymentMethods,
  exportData,
  clearCache,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

router.use(protect, requireAdmin);

router.get('/activity-log', getActivityLog);
router.put('/maintenance-mode', setMaintenanceMode);
router.get('/health', getHealth);
router.get('/fleet-utilization', getFleetUtilization);
router.get('/customer-segments', getCustomerSegments);
router.get('/revenue-breakdown', getRevenueBreakdown);
router.get('/payment-methods', getPaymentMethods);
router.post('/data/export', exportData);
router.post('/data/clear-cache', clearCache);

module.exports = router;
