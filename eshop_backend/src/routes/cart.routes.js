const r = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/cart.controller');
r.get('/', requireAuth, c.getCart);
r.post('/items', requireAuth, c.upsertItem);
module.exports = r;
