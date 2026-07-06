const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    hour:  { type: Number, default: 0 },
    day:   { type: Number, default: 0 },
    week:  { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    year:  { type: Number, default: 0 },
  },
  { _id: false }
);

const vehicleSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    brand:        { type: String, required: true, trim: true },
    model:        { type: String, required: true, trim: true },
    year:         { type: Number, required: true },
    type:         { type: String, required: true, enum: ['Car', 'SUV', 'Van', 'Truck', 'Motorcycle', 'Bike', 'E-Bike', 'Tuk-Tuk'] },
    fuel:         { type: String, required: true, enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'N/A'] },
    transmission: { type: String, required: true, enum: ['Automatic', 'Manual'] },
    seats:        { type: Number, required: true },
    location:     { type: String, required: true },
    description:  { type: String, default: '' },
    images:       [{ type: String }],
    available:    { type: Boolean, default: true },
    rating:       { type: Number, default: 0, min: 0, max: 5 },
    trips:        { type: Number, default: 0 },
    pricing:      { type: pricingSchema, required: true },
    features:     [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
