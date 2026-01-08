const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
    async createCheckoutSession(orderData) {
        const { orderId, email, items, totalCents, successUrl, cancelUrl } = orderData;

        try {
            const lineItems = items.map(item => ({
                price_data: {
                    currency: 'ron',
                    product_data: {
                        name: item.title,
                        description: `Produs #${item.id}`,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            }));


            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/cart`,
                customer_email: email,
                metadata: {
                    orderId: orderId.toString(),
                },
                invoice_creation: {
                    enabled: true,
                },
            });

            console.log(`[PaymentService] Sesiune Stripe creată: ${session.id} pentru comanda #${orderId}`);

            return {
                sessionId: session.id,
                sessionUrl: session.url,
            };

        } catch (error) {
            console.error('[PaymentService] Eroare creare sesiune Stripe:', error);
            throw new Error('Eroare la procesarea plății');
        }
    }

    async getSessionStatus(sessionId) {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            return {
                paymentStatus: session.payment_status, // 'paid', 'unpaid', 'no_payment_required'
                orderId: session.metadata.orderId,
                email: session.customer_email,
                amountTotal: session.amount_total,
            };

        } catch (error) {
            console.error('[PaymentService] Eroare verificare sesiune:', error);
            throw new Error('Eroare la verificarea plății');
        }
    }

    async handleWebhookEvent(event) {
        console.log(`[PaymentService] Webhook primit: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const orderId = session.metadata.orderId;

                console.log(`[PaymentService] Plată confirmată pentru comanda #${orderId}`);

                return {
                    orderId,
                    paymentStatus: 'paid',
                    email: session.customer_email,
                    amountPaid: session.amount_total,
                };

            case 'payment_intent.succeeded':
                console.log('[PaymentService] Payment Intent succeeded');
                break;

            case 'payment_intent.payment_failed':
                console.log('[PaymentService] Payment Intent failed');
                break;

            default:
                console.log(`[PaymentService] Eveniment neprocesat: ${event.type}`);
        }

        return null;
    }

    async createRefund(paymentIntentId, amountCents) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amountCents,
            });

            console.log(`[PaymentService] Refund creat: ${refund.id} pentru ${amountCents / 100} RON`);

            return {
                refundId: refund.id,
                status: refund.status, // 'succeeded', 'pending', 'failed'
                amount: refund.amount / 100,
            };

        } catch (error) {
            console.error('[PaymentService] Eroare creare refund:', error);
            throw new Error('Eroare la rambursarea banilor');
        }
    }
}

module.exports = new PaymentService();