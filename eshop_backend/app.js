require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use(morgan('dev'));

//User routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/products', require('./src/routes/products.routes'));
app.use('/api/cart', require('./src/routes/cart.routes'));
app.use('/api/orders', require('./src/routes/orders.routes'));
app.use('/api/account', require('./src/routes/account.routes'));

//Admin
app.use('/api/admin/products', require('./src/routes/admin.products.routes'));
app.use('/api/admin/orders', require('./src/routes/admin.orders.routes'));

app.get('/', (req, res) => {
    res.send('E-Shop API is running...');
});

// Start server
const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`API running on port ${port}`));
