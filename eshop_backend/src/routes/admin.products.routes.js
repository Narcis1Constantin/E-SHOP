const r = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/admin.products.controller');

r.use(requireAuth, requireRole('admin'));
r.get('/', c.list);
r.post('/', c.create);
r.put('/:id', c.update);
r.delete('/:id', c.remove);

module.exports = r;