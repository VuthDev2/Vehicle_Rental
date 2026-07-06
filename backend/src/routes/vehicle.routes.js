const express = require('express');
const router = express.Router();
const {
  getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, uploadImages,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const upload = require('../middleware/upload');

router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.post('/', protect, requireAdmin, createVehicle);
router.put('/:id', protect, requireAdmin, updateVehicle);
router.delete('/:id', protect, requireAdmin, deleteVehicle);
router.post('/:id/images', protect, requireAdmin, upload.array('images', 10), uploadImages);

module.exports = router;
