const express = require('express');
const router = express.Router();
const {
  getPromotions, createPromotion, updatePromotion, deletePromotion, validatePromotion,
} = require('../controllers/promotionController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

router.get('/', protect, requireAdmin, getPromotions);
router.post('/', protect, requireAdmin, createPromotion);
router.post('/validate', protect, validatePromotion);
router.put('/:id', protect, requireAdmin, updatePromotion);
router.delete('/:id', protect, requireAdmin, deletePromotion);

module.exports = router;
