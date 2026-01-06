const OrderService = require("../services/OrderService");
const NotificationService = require("../services/NotificationService");
const PaymentService = require("../services/PaymentService");
const InvoiceService = require("../services/InvoiceService");

class CheckoutFacade {
    /**
     * VERSIUNEA CU STRIPE
     * Metoda simplificată pe care o apelează Controller-ul.
     * Ascunde complexitatea calculelor, tranzacțiilor DB, Stripe și email-ului.
     */
    async placeOrder(user, orderData) {
        const { address, email, items, paymentMethod } = orderData;

        // 1. Validare Logică (Business Logic)
        if (!items || items.length === 0) {
            throw new Error('Coșul este gol');
        }

        // 2. Calcul Total (Logica de preț)
        let total = 0;
        for (const it of items) {
            total += (Number(it.price) || 0) * it.quantity;
        }
        const totalCents = Math.round(total * 100);

        // 3. Persistență (Order Subsystem)
        const orderId = await OrderService.createOrderTransaction(
            user.uid,
            totalCents,
            address,
            items
        );

        console.log(`[CheckoutFacade] Comandă #${orderId} creată. Payment method: ${paymentMethod}`);

        // 4. Procesare plată în funcție de metodă
        if (paymentMethod === 'card') {
            // === PLATĂ CU CARD (STRIPE) ===
            const paymentResult = await PaymentService.createCheckoutSession({
                orderId,
                email,
                items,
                totalCents,
                cancelUrl: `${process.env.FRONTEND_URL}/cart`,
            });

            console.log(`[CheckoutFacade] Sesiune Stripe creată: ${paymentResult.sessionId}`);

            // Returnăm URL-ul de plată Stripe
            return {
                orderId,
                total,
                status: 'pending_payment',
                paymentUrl: paymentResult.sessionUrl,
                sessionId: paymentResult.sessionId,
            };

        } else {
            // === PLATĂ RAMBURS (CASH ON DELIVERY) ===
            // Trimitem email de confirmare direct (fără plată online)
            await this._sendOrderConfirmationWithInvoice(orderId, email, total, items, address, user.name || 'Client');

            return {
                orderId,
                total,
                status: 'placed',
                message: 'Comandă plasată cu succes! Vei plăti la livrare.',
            };
        }
    }

    /**
     * Confirmă plata după ce Stripe notifică webhook-ul
     * Apelat din webhook controller
     */
    async confirmPayment(orderId, email, customerName, paymentIntentId) {
        try {
            console.log(`[CheckoutFacade] Confirmare plată pentru comanda #${orderId}`);

            // 1. Actualizăm statusul comenzii în DB + salvăm payment_intent_id
            const pool = require('../db/pool');
            await pool.query(
                `UPDATE orders SET status = $1, payment_intent_id = $2 WHERE id = $3`,
                ['paid', paymentIntentId, orderId]
            );

            console.log(`[CheckoutFacade] Payment Intent ID salvat: ${paymentIntentId}`);

            // 2. Obținem detaliile comenzii pentru factură
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

            // 3. Obținem produsele
            const { rows: items } = await pool.query(
                `SELECT oi.qty as quantity, oi.price_cents, p.title,
                        ROUND(oi.price_cents / 100.0, 2) as price
                 FROM order_items oi
                          LEFT JOIN products p ON p.id = oi.product_id
                 WHERE oi.order_id = $1`,
                [orderId]
            );

            // 4. Trimitem email cu factură
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

    /**
     * Funcție internă pentru trimitere email + factură PDF
     * @private
     */
    async _sendOrderConfirmationWithInvoice(orderId, email, total, items, address, customerName) {
        try {
            // 1. Generăm factura PDF
            const invoicePath = await InvoiceService.generateInvoice({
                orderId,
                customerName,
                email,
                address,
                items,
                totalCents: Math.round(total * 100),
                createdAt: new Date(),
            });

            // 2. Trimitem email cu factura atașată
            await NotificationService.sendOrderConfirmationWithInvoice(
                email,
                orderId,
                total,
                items,
                address,
                invoicePath
            );

            // 3. Curățăm fișierul PDF după trimitere
            await InvoiceService.deleteInvoice(invoicePath);

            console.log(`[CheckoutFacade] Email + factură trimisă pentru comanda #${orderId}`);

        } catch (error) {
            console.error('[CheckoutFacade] Eroare trimitere email cu factură:', error);
            // Nu aruncăm eroare - nu vrem să blocăm procesul dacă emailul eșuează
        }
    }
}

module.exports = new CheckoutFacade();