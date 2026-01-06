const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CheckoutFacade = require('../facades/CheckoutFacade');

/**
 * WEBHOOK STRIPE
 * Endpoint special pentru notificări de la Stripe
 */
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verificăm semnătura webhook-ului (securitate)
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`✅ Webhook primit: ${event.type}`);

    // Procesăm evenimentul
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;

            // Extragem datele din metadata și session
            const orderId = session.metadata.orderId;
            const email = session.customer_email;
            const customerName = session.customer_details?.name || 'Client';
            const paymentIntentId = session.payment_intent; // ← IMPORTANT: Payment Intent ID

            console.log(`💳 Plată confirmată pentru comanda #${orderId}`);
            console.log(`💰 Payment Intent ID: ${paymentIntentId}`);

            // Confirmăm plata prin Facade + salvăm payment_intent_id
            try {
                await CheckoutFacade.confirmPayment(orderId, email, customerName, paymentIntentId);
                console.log(`✅ Comanda #${orderId} marcată ca plătită`);
            } catch (error) {
                console.error(`❌ Eroare procesare webhook pentru comanda #${orderId}:`, error);
            }
            break;

        case 'payment_intent.succeeded':
            console.log('💰 Payment Intent succeeded');
            break;

        case 'payment_intent.payment_failed':
            console.log('❌ Payment Intent failed');
            break;

        default:
            console.log(`Eveniment neprocesat: ${event.type}`);
    }

    // Confirmăm primirea webhook-ului către Stripe
    res.json({ received: true });
};

/**
 * VERIFICARE STATUS PLATĂ
 * Pentru frontend să verifice dacă plata a fost procesată
 */
exports.checkPaymentStatus = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            paymentStatus: session.payment_status,
            orderId: session.metadata.orderId,
        });
    } catch (error) {
        console.error('Eroare verificare status:', error);
        res.status(500).json({ error: 'Eroare verificare plată' });
    }
};