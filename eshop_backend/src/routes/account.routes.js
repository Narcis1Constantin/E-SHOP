const r = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/account.controller');

// Toate rutele necesită autentificare
r.use(requireAuth);

// GET /api/account/me - obține datele user-ului curent
r.get('/me', c.getMe);

// PUT /api/account/me - actualizează datele user-ului curent
r.put('/me', c.updateMe);

module.exports = r;