const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { updateUserRules, mongoIdRule } = require('../middleware/validate');

router.get('/', protect, requireAdmin, getUsers);
router.get('/:id', protect, mongoIdRule(), getUser);
router.put('/:id', protect, mongoIdRule(), updateUserRules, updateUser);
router.delete('/:id', protect, requireAdmin, mongoIdRule(), deleteUser);

module.exports = router;
