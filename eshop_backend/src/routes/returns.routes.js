const express = require('express');
const router = express.Router();
const returnsController = require('../controllers/returns.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

// Rute user
router.post('/', requireAuth, returnsController.createReturn);
router.get('/my', requireAuth, returnsController.getMyReturns);

// Rute admin
router.get('/admin/all', requireAuth, requireRole('admin'), returnsController.listAll);
router.get('/admin/:id', requireAuth, requireRole('admin'), returnsController.getById);
router.put('/admin/:id', requireAuth, requireRole('admin'), returnsController.updateStatus);
router.delete('/admin/:id', requireAuth, requireRole('admin'), returnsController.deleteReturn);

module.exports = router;