const r = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/account.controller');

r.get('/me',requireAuth, c.getMyAccount);
r.put('/update', requireAuth,c.updateProfile);
r.post('/upgrade',requireAuth ,c.upgradeToPremium);

module.exports = r;
