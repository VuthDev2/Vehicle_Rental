const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUser, updateUser, deleteUser, uploadIdDocument } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { updateUserRules, mongoIdRule } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.post('/upload-id', protect, upload.single('idDocument'), upload.resizeAndSave, uploadIdDocument);

router.post('/', protect, requireAdmin, createUser);
router.get('/', protect, requireAdmin, getUsers);
router.get('/:id', protect, mongoIdRule(), getUser);
router.put('/:id', protect, mongoIdRule(), updateUserRules, updateUser);
router.delete('/:id', protect, requireAdmin, mongoIdRule(), deleteUser);

module.exports = router;
