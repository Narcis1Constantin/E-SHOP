const r = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/account.controller');

r.use(requireAuth);
r.get('/me', c.getMe);
r.put('/me', c.updateMe);

module.exports = r;