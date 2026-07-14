const express = require('express');
const router = express.Router();
const { createReview, getVehicleReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { createReviewRules, mongoIdRule } = require('../middleware/validate');

router.post('/', protect, createReviewRules, createReview);
router.get('/vehicle/:vehicleId', getVehicleReviews);
router.delete('/:id', protect, requireAdmin, mongoIdRule(), deleteReview);

module.exports = router;
