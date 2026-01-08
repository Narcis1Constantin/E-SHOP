const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripe.webhook.controller');

router.get('/payment-status/:sessionId', stripeWebhookController.checkPaymentStatus);

module.exports = router;