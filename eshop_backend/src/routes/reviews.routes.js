const r = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/reviews.controller');

r.get('/products/:productId/reviews', c.getProductReviews);
r.post('/products/:productId/reviews', requireAuth, c.addReview);

module.exports = r;