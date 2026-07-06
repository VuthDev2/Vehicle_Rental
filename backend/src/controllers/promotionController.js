const Promotion = require('../models/Promotion');

// GET /api/promotions (admin)
const getPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json({ promotions });
  } catch (err) {
    next(err);
  }
};

// POST /api/promotions (admin)
const createPromotion = async (req, res, next) => {
  try {
    const promo = await Promotion.create(req.body);
    res.status(201).json({ promotion: promo });
  } catch (err) {
    next(err);
  }
};

// PUT /api/promotions/:id (admin)
const updatePromotion = async (req, res, next) => {
  try {
    const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!promo) return res.status(404).json({ message: 'Promotion not found.' });
    res.json({ promotion: promo });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/promotions/:id (admin)
const deletePromotion = async (req, res, next) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promotion not found.' });
    res.json({ message: 'Promotion deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/promotions/validate
const validatePromotion = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const promo = await Promotion.findOne({ code: code.toUpperCase(), active: true });

    if (!promo) return res.status(404).json({ valid: false, message: 'Invalid promo code.' });

    const now = new Date();
    if (promo.expiresAt && promo.expiresAt < now) {
      return res.json({ valid: false, message: 'Promo code has expired.' });
    }
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return res.json({ valid: false, message: 'Promo code usage limit reached.' });
    }
    if (amount < promo.minAmount) {
      return res.json({ valid: false, message: `Minimum order of $${promo.minAmount} required.` });
    }

    const discount = promo.discountType === 'percent'
      ? (amount * promo.value) / 100
      : promo.value;

    res.json({ valid: true, discount: Math.min(discount, amount), promo });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPromotions, createPromotion, updatePromotion, deletePromotion, validatePromotion };
