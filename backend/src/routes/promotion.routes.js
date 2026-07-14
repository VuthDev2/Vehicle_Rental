const express = require('express');
const router = express.Router();
const {
  getPromotions, createPromotion, updatePromotion, deletePromotion, validatePromotion,
} = require('../controllers/promotionController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { createPromotionRules, mongoIdRule } = require('../middleware/validate');

router.get('/', protect, requireAdmin, getPromotions);
router.post('/', protect, requireAdmin, createPromotionRules, createPromotion);
router.post('/validate', protect, validatePromotion);
router.put('/:id', protect, requireAdmin, mongoIdRule(), updatePromotion);
router.delete('/:id', protect, requireAdmin, mongoIdRule(), deletePromotion);

module.exports = router;
