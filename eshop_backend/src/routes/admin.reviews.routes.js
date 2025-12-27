const r = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/reviews.controller');

r.use(requireAuth, requireRole('admin'));

// DELETE recenzie
r.delete('/:reviewId', c.deleteReview);

module.exports = r;