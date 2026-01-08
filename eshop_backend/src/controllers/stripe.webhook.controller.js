const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CheckoutFacade = require('../facades/CheckoutFacade');

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Webhook primit: ${event.type}`);

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;

            // extragem datele din metadata si session
            const orderId = session.metadata.orderId;
            const email = session.customer_email;
            const customerName = session.customer_details?.name || 'Client';
            const paymentIntentId = session.payment_intent; // ← IMPORTANT: Payment Intent ID

            console.log(`Plată confirmată pentru comanda #${orderId}`);
            console.log(`Payment Intent ID: ${paymentIntentId}`);

            // confirmam plata prin Facade + salvam payment_intent_id
            try {
                await CheckoutFacade.confirmPayment(orderId, email, customerName, paymentIntentId);
                console.log(`Comanda #${orderId} marcată ca plătită`);
            } catch (error) {
                console.error(`Eroare procesare webhook pentru comanda #${orderId}:`, error);
            }
            break;

        case 'payment_intent.succeeded':
            console.log('Payment Intent succeeded');
            break;

        case 'payment_intent.payment_failed':
            console.log('Payment Intent failed');
            break;

        default:
            console.log(`Eveniment neprocesat: ${event.type}`);
    }

    res.json({ received: true });
};

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