const express = require('express');
const router = express.Router();
const usersController = require('../controllers/admin.users.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

// toate rutele necesita autentificare admin
router.get('/all', requireAuth, requireRole('admin'), usersController.listAll);
router.get('/stats', requireAuth, requireRole('admin'), usersController.getStats);
router.get('/:id', requireAuth, requireRole('admin'), usersController.getById);
router.put('/:id/role', requireAuth, requireRole('admin'), usersController.updateRole);
router.delete('/:id', requireAuth, requireRole('admin'), usersController.deleteUser);

module.exports = router;