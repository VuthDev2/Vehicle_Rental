const vehicleService = require('../services/vehicleService');

// GET /api/vehicles/stats
const getVehicleStats = async (req, res, next) => {
  try {
    const stats = await vehicleService.getVehicleStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// GET /api/vehicles
const getVehicles = async (req, res, next) => {
  try {
    const data = await vehicleService.getVehicles(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /api/vehicles/:id
const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
};

// POST /api/vehicles (admin)
const createVehicle = async (req, res, next) => {
  try {
    // Whitelist allowed fields to prevent mass assignment of internal fields
    // like `rating`, `trips`, `available` etc.
    const {
      name, brand, model, year, type, fuel, transmission,
      seats, location, pricing, description, features, available,
    } = req.body;

    const vehicle = await vehicleService.createVehicle({
      name, brand, model, year, type, fuel, transmission,
      seats, location, pricing, description, features, available,
    });
    
    res.status(201).json({ vehicle });
  } catch (err) {
    next(err);
  }
};

// PUT /api/vehicles/:id (admin)
const updateVehicle = async (req, res, next) => {
  try {
    // Whitelist allowed fields — prevent overwriting internal computed fields
    const {
      name, brand, model, year, type, fuel, transmission,
      seats, location, pricing, description, features, available,
    } = req.body;

    const updates = {
      ...(name !== undefined && { name }),
      ...(brand !== undefined && { brand }),
      ...(model !== undefined && { model }),
      ...(year !== undefined && { year }),
      ...(type !== undefined && { type }),
      ...(fuel !== undefined && { fuel }),
      ...(transmission !== undefined && { transmission }),
      ...(seats !== undefined && { seats }),
      ...(location !== undefined && { location }),
      ...(pricing !== undefined && { pricing }),
      ...(description !== undefined && { description }),
      ...(features !== undefined && { features }),
      ...(available !== undefined && { available }),
    };

    const vehicle = await vehicleService.updateVehicle(req.params.id, updates);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vehicles/:id (admin)
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.deleteVehicle(req.params.id);
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
    
    const { vehicle, imageUrls } = await vehicleService.addImages(req.params.id, req.files);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    
    res.json({ vehicle, imageUrls });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vehicles/:id/images/:imageIndex (admin)
const deleteImage = async (req, res, next) => {
  try {
    const index = parseInt(req.params.imageIndex);
    const vehicle = await vehicleService.deleteImage(req.params.id, index);
    
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

    res.json({ vehicle, message: 'Image deleted.' });
  } catch (err) {
    if (err.message === 'Invalid image index.') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

module.exports = {
  getVehicleStats,
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadImages,
  deleteImage,
};
