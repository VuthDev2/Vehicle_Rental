const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    category:    { type: String, required: true, trim: true },
    amount:      { type: Number, required: true, min: 0, default: 0 },
    color:       { type: String, default: '#6B7280' },
    description: { type: String, default: '' },
    month:       { type: Number },          // 1-12, optional for monthly tracking
    year:        { type: Number },           // optional for monthly tracking
    vehicleId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }, // optional, link to specific vehicle
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

expenseSchema.index({ category: 1 });
expenseSchema.index({ year: 1, month: 1 });
expenseSchema.index({ vehicleId: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
