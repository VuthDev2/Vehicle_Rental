const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

router.get('/', protect, requireAdmin, getSettings);
router.put('/', protect, requireAdmin, updateSettings);

module.exports = router;
