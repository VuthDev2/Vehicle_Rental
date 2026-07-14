const express = require('express');
const router = express.Router();
const {
  getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, uploadImages, deleteImage,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const upload = require('../middleware/upload');
const { resizeAndSave } = require('../middleware/upload');
const { createVehicleRules, mongoIdRule } = require('../middleware/validate');

router.get('/', getVehicles);
router.get('/:id', mongoIdRule(), getVehicle);
router.post('/', protect, requireAdmin, createVehicleRules, createVehicle);
router.put('/:id', protect, requireAdmin, updateVehicle);
router.delete('/:id', protect, requireAdmin, mongoIdRule(), deleteVehicle);
router.post('/:id/images', protect, requireAdmin, upload.array('images', 10), resizeAndSave, uploadImages);
router.delete('/:id/images/:imageIndex', protect, requireAdmin, deleteImage);

module.exports = router;
