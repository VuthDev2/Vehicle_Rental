const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

const guard = [protect, requireAdmin];

router.get('/summary',                ...guard, ctrl.getSummary);
router.get('/revenue',                ...guard, ctrl.getRevenue);
router.get('/revenue-monthly',        ...guard, ctrl.getRevenueMonthly);
router.get('/popular-vehicles',       ...guard, ctrl.getPopularVehicles);
router.get('/dashboard',              ...guard, ctrl.getDashboard);
router.get('/category-revenue',       ...guard, ctrl.getCategoryRevenue);
router.get('/category-details/:type', ...guard, ctrl.getCategoryDetails);
router.get('/booking-status-details', ...guard, ctrl.getBookingStatusDetails);
// Owner report routes
router.get('/owner-summary',          ...guard, ctrl.getOwnerSummary);
router.get('/fleet-performance',      ...guard, ctrl.getFleetPerformance);
router.get('/booking-analytics',      ...guard, ctrl.getBookingAnalytics);
router.get('/customer-insights',      ...guard, ctrl.getCustomerInsights);
router.get('/revenue-by-vehicle',     ...guard, ctrl.getRevenueByVehicle);
// Expense management
router.get('/expenses',               ...guard, ctrl.getExpenses);
router.post('/expenses',              ...guard, ctrl.addExpense);
router.post('/expenses/bulk',         ...guard, ctrl.saveExpenses);
router.put('/expenses/:id',           ...guard, ctrl.updateExpense);
router.delete('/expenses/:id',        ...guard, ctrl.deleteExpense);

module.exports = router;
