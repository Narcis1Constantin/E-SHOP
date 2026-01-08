const OrderService = require("../services/OrderService");
const NotificationService = require("../services/NotificationService");
const PaymentService = require("../services/PaymentService");
const InvoiceService = require("../services/InvoiceService");

class CheckoutFacade {
    async placeOrder(user, orderData) {
        const { address, email, items, paymentMethod } = orderData;

        if (!items || items.length === 0) {
            throw new Error('Coșul este gol');
        }

        let total = 0;
        for (const it of items) {
            total += (Number(it.price) || 0) * it.quantity;
        }
        const totalCents = Math.round(total * 100);
        const orderId = await OrderService.createOrderTransaction(
            user.uid,
            totalCents,
            address,
            items
        );

        console.log(`[CheckoutFacade] Comandă #${orderId} creată. Payment method: ${paymentMethod}`);

        if (paymentMethod === 'card') {
            //PLATA CU CARD
            const paymentResult = await PaymentService.createCheckoutSession({
                orderId,
                email,
                items,
                totalCents,
                cancelUrl: `${process.env.FRONTEND_URL}/cart`,
            });

            console.log(`[CheckoutFacade] Sesiune Stripe creată: ${paymentResult.sessionId}`);

            return {
                orderId,
                total,
                status: 'pending_payment',
                paymentUrl: paymentResult.sessionUrl,
                sessionId: paymentResult.sessionId,
            };

        } else {
            // PLATA RAMBURS
            await this._sendOrderConfirmationWithInvoice(orderId, email, total, items, address, user.name || 'Client');

            return {
                orderId,
                total,
                status: 'placed',
                message: 'Comandă plasată cu succes! Vei plăti la livrare.',
            };
        }
    }

    async confirmPayment(orderId, email, customerName, paymentIntentId) {
        try {
            console.log(`[CheckoutFacade] Confirmare plată pentru comanda #${orderId}`);

            const pool = require('../db/pool');
            await pool.query(
                `UPDATE orders SET status = $1, payment_intent_id = $2 WHERE id = $3`,
                ['paid', paymentIntentId, orderId]
            );

            console.log(`[CheckoutFacade] Payment Intent ID salvat: ${paymentIntentId}`);

            const { rows } = await pool.query(
                `SELECT o.*, u.name
                 FROM orders o
                          JOIN users u ON u.id = o.user_id
                 WHERE o.id = $1`,
                [orderId]
            );

            if (!rows.length) {
                throw new Error('Comanda nu a fost găsită');
            }

            const order = rows[0];

            const { rows: items } = await pool.query(
                `SELECT oi.qty as quantity, oi.price_cents, p.title,
                        ROUND(oi.price_cents / 100.0, 2) as price
                 FROM order_items oi
                          LEFT JOIN products p ON p.id = oi.product_id
                 WHERE oi.order_id = $1`,
                [orderId]
            );

            await this._sendOrderConfirmationWithInvoice(
                orderId,
                email,
                order.total_cents / 100,
                items,
                order.address,
                customerName || order.name || 'Client'
            );

            console.log(`[CheckoutFacade] Plată confirmată și email trimis pentru #${orderId}`);

        } catch (error) {
            console.error('[CheckoutFacade] Eroare confirmare plată:', error);
            throw error;
        }
    }


    async _sendOrderConfirmationWithInvoice(orderId, email, total, items, address, customerName) {
        try {
            // generam factura PDF
            const invoicePath = await InvoiceService.generateInvoice({
                orderId,
                customerName,
                email,
                address,
                items,
                totalCents: Math.round(total * 100),
                createdAt: new Date(),
            });

            // trimitem email cu factura
            await NotificationService.sendOrderConfirmationWithInvoice(
                email,
                orderId,
                total,
                items,
                address,
                invoicePath
            );

            await InvoiceService.deleteInvoice(invoicePath);

            console.log(`[CheckoutFacade] Email + factură trimisă pentru comanda #${orderId}`);

        } catch (error) {
            console.error('[CheckoutFacade] Eroare trimitere email cu factură:', error);
        }
    }
}

module.exports = new CheckoutFacade();