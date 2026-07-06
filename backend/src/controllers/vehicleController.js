const Vehicle = require('../models/Vehicle');
const path = require('path');

// GET /api/vehicles
const getVehicles = async (req, res, next) => {
  try {
    const { query, type, fuel, transmission, location, minPrice, maxPrice, available, sort } = req.query;

    const filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ];
    }
    if (type) filter.type = type;
    if (fuel) filter.fuel = fuel;
    if (transmission) filter.transmission = transmission;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (available === 'true') filter.available = true;
    if (minPrice) filter['pricing.day'] = { $gte: Number(minPrice) };
    if (maxPrice) filter['pricing.day'] = { ...filter['pricing.day'], $lte: Number(maxPrice) };

    let sortQuery = { createdAt: -1 };
    if (sort === 'price_asc') sortQuery = { 'pricing.day': 1 };
    if (sort === 'price_desc') sortQuery = { 'pricing.day': -1 };
    if (sort === 'rating') sortQuery = { rating: -1 };
    if (sort === 'trips') sortQuery = { trips: -1 };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort(sortQuery).skip(skip).limit(limit),
      Vehicle.countDocuments(filter),
    ]);

    res.json({ vehicles, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/vehicles/:id
const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
};

// POST /api/vehicles (admin)
const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ vehicle });
  } catch (err) {
    next(err);
  }
};

// PUT /api/vehicles/:id (admin)
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vehicles/:id (admin)
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ message: 'Vehicle deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/vehicles/:id/images (admin, multer)
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }
    const imageUrls = req.files.map((f) => `/uploads/${f.filename}`);
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ vehicle, imageUrls });
  } catch (err) {
    next(err);
  }
};

module.exports = { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, uploadImages };
