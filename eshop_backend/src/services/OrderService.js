const pool = require("../db/pool");

class OrderService {
    async createOrderTransaction(userId, totalCents, address, items) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Insert Order
            const orderRes = await client.query(
                `INSERT INTO orders (user_id, total_cents, status, address)
                 VALUES ($1, $2, 'placed', $3) RETURNING id`,
                [userId, totalCents, address]
            );
            const orderId = orderRes.rows[0].id;

            // 2. Insert Items
            for (const it of items) {
                await client.query(
                    `INSERT INTO order_items(order_id, product_id, qty, price_cents)
                     VALUES ($1, $2, $3, $4)`,
                    [orderId, it.id, it.quantity, Math.round(it.price * 100)]
                );
            }

            await client.query('COMMIT');
            return orderId;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = new OrderService();