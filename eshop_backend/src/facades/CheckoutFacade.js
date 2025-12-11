const OrderService = require("../services/OrderService");
const NotificationService = require("../services/NotificationService");

class CheckoutFacade {
    /**
     * Metoda simplificată pe care o apelează Controller-ul.
     * Ascunde complexitatea calculelor, tranzacțiilor DB și email-ului.
     */
    async placeOrder(user, orderData) {
        const { address, email, items } = orderData;

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

        // 4. Notificare (Notification Subsystem)
        // Fire & Forget - nu așteptăm neapărat să blocheze răspunsul
        NotificationService.sendOrderConfirmation(email, orderId, total, items, address);

        return { orderId, total, status: 'success' };
    }
}

module.exports = new CheckoutFacade();