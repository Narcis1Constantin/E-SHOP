const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { requireAuth } = require('../middleware/auth');


/**
 * POST /api/chat/gusti
 * Chat cu Gusti (necesită autentificare)
 */
router.post('/gusti', requireAuth, chatController.chatWithGusti);
;


/**
 * GET /api/chat/stats
 * Statistici utilizare chatbot (doar ADMIN)
 */
router.get('/stats', requireAuth, chatController.getChatStats)

module.exports = router;