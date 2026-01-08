const express = require('express');
const router = express.Router();
const financingController = require('../controllers/financing.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

// ruta publica
router.post('/apply', requireAuth, financingController.applyForFinancing);
router.get('/my-applications', requireAuth, financingController.myApplications);

// rute admin
router.get('/admin/all', requireAuth, requireRole('admin'), financingController.listAll);
router.put('/admin/:id', requireAuth, requireRole('admin'), financingController.updateStatus);
router.delete('/admin/:id', requireAuth, requireRole('admin'), financingController.deleteApplication);
module.exports = router;