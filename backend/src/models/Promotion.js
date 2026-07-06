const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    description:   { type: String, default: '' },
    discountType:  { type: String, enum: ['percent', 'fixed'], required: true },
    value:         { type: Number, required: true, min: 0 },
    minAmount:     { type: Number, default: 0 },
    maxUses:       { type: Number, default: null },
    usedCount:     { type: Number, default: 0 },
    expiresAt:     { type: Date, default: null },
    active:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Promotion', promotionSchema);
