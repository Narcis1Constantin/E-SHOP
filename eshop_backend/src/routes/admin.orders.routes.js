const r = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/admin.orders.controller');

r.use(requireAuth, requireRole('admin'));
r.get('/', c.listAll);
r.get('/:id', c.getById);
r.patch('/:id/status', c.updateStatus);

module.exports = r;
