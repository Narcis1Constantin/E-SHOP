const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

/**
 * POST /api/contact/send
 * Trimite mesaj de contact
 * NU necesită autentificare - oricine poate trimite mesaj
 */
router.post('/send', contactController.sendContactMessage);

module.exports = router;