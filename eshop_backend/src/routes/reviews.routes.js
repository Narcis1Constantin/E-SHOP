const r = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/reviews.controller');

// GET recenzii pentru un produs (public)
r.get('/products/:productId/reviews', c.getProductReviews);

// POST recenzie (autentificat)
r.post('/products/:productId/reviews', requireAuth, c.addReview);

module.exports = r;