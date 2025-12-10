const express = require('express');
const router = express.Router();
const controller = require('../controllers/orders.controller');
const auth = require('../middleware/auth');

// Această linie este critică:
router.post('/place', auth.requireAuth, controller.placeOrder);

router.get('/mine', auth.requireAuth, controller.listMyOrders);
router.get('/:id', auth.requireAuth, controller.getMyOrder);

module.exports = router;