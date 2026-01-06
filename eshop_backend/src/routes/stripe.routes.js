const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripe.webhook.controller');


// Verificare status plată (opțional - pentru frontend)
router.get('/payment-status/:sessionId', stripeWebhookController.checkPaymentStatus);

module.exports = router;