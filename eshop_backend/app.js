require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const stripeWebhookController = require('./src/controllers/stripe.webhook.controller');

const app = express();

// --- MODIFICARE 1: Folosim cale relativă, nu URL complet hardcodat ---
// Vechi: 'https://eshop-backend.onrender.com/api/stripe/webhook'
app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhookController.handleStripeWebhook
);

// Middleware
// Asigură-te că în Vercel la Environment Variables pui FRONTEND_URL (ex: https://site-ul-tau.vercel.app)
// app.use(cors({
//     origin: process.env.FRONTEND_URL || '*', // Fallback pe '*' dacă uiți variabila, dar nu e recomandat prod
//     credentials: true
// }));
// const cors = require('cors');
app.use(cors({
    origin: 'https://smart-depot.vercel.app' // URL-ul tău de Vercel (fără / la final)
}));

app.use(express.json());
app.use(morgan('dev'));

// User routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/products', require('./src/routes/products.routes'));
app.use('/api/cart', require('./src/routes/cart.routes'));
app.use('/api/orders', require('./src/routes/orders.routes'));
// app.use('/api/account', require('./src/routes/account.routes')); // Era duplicat mai jos, l-am comentat aici

// Admin
app.use('/api/admin/products', require('./src/routes/admin.products.routes'));
app.use('/api/admin/orders', require('./src/routes/admin.orders.routes'));

app.get('/', (req, res) => {
    res.send('E-Shop API is running...');
});

// --- RUTELE TALE (le-am păstrat ordinea) ---
const accountRoutes = require('./src/routes/account.routes');
app.use('/api/account', accountRoutes);

const reviewsRoutes = require('./src/routes/reviews.routes');
const adminReviewsRoutes = require('./src/routes/admin.reviews.routes');

app.use('/api', reviewsRoutes); // Verifică dacă reviewsRoutes are prefixul corect în fișierul lui
app.use('/api/admin/reviews', adminReviewsRoutes);

const financingRoutes = require('./src/routes/financing.routes');
app.use('/api/financing', financingRoutes);

const usersRoutes = require('./src/routes/admin.users.routes');
app.use('/api/admin/users', usersRoutes);

const returnsRoutes = require('./src/routes/returns.routes');
app.use('/api/returns', returnsRoutes);

const chatRoutes = require('./src/routes/chat.routes');
app.use('/api/chat', chatRoutes);

const contactRoutes = require('./src/routes/contact.routes');
app.use('/api/contact', contactRoutes);

// --- MODIFICARE 2: Export pentru Vercel ---
// Pe Vercel, nu folosim app.listen direct în modul clasic.
// Folosim această structură ca să meargă și local, și pe Vercel:

const port = process.env.PORT || 3002;

if (require.main === module) {
    // Asta rulează doar când dai "node app.js" local
    app.listen(port, () => console.log(`API running on port ${port}`));
}

// Exportăm aplicația pentru ca Vercel să o poată prelua
module.exports = app;