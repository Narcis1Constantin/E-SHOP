const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { requireAuth } = require('../middleware/auth');


router.post('/gusti', requireAuth, chatController.chatWithGusti);
router.get('/stats', requireAuth, chatController.getChatStats);

module.exports = router;