const r = require('express').Router();
const c = require('../controllers/products.controller');
r.get('/', c.list);
module.exports = r;
