const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

router.get('/', protect, requireAdmin, getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, requireAdmin, deleteUser);

module.exports = router;
