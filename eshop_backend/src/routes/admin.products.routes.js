const r = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/admin.products.controller');

// Toate rutele necesită autentificare și rol de admin
r.use(requireAuth, requireRole('admin'));

// GET /api/admin/products - lista produse (pentru admin)
r.get('/', c.list);

// POST /api/admin/products - creare produs nou
r.post('/', c.create);

// PUT /api/admin/products/:id - actualizare produs
r.put('/:id', c.update);

// DELETE /api/admin/products/:id - ștergere produs
r.delete('/:id', c.remove);

module.exports = r;