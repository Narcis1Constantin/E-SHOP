const CheckoutFacade = require('../facades/CheckoutFacade');
const pool = require('../db/pool');


exports.placeOrder = async (req, res) => {
    try {
        const result = await CheckoutFacade.placeOrder(req.user, req.body);
        res.status(201).json(result);

    } catch (e) {
        console.error("Eroare în placeOrder Controller:", e);

        let status = 500;
        if (e.message === 'Coșul este gol' || e.message === 'Adresă lipsă') {
            status = 400;
        }

        res.status(status).json({ error: e.message });
    }
};

//LISTARE COMENZI
exports.listMyOrders = async (req, res) => {
    try {
        console.log('listMyOrders - req.user:', req.user);

        // obține comenzile utilizatorului
        const { rows: orders } = await pool.query(
            `SELECT id, total_cents, status, address, created_at, payment_ref, return_status
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.uid]
        );

        console.log('Orders found:', orders.length);

        // pentru fiecare comandă, obține produsele din order_items
        for (let order of orders) {
            // calculează total în lei
            order.total = order.total_cents ? (order.total_cents / 100).toFixed(2) : '0';

            // obtine produsele comenzii cu JOIN la products pentru nume
            const { rows: items } = await pool.query(
                `SELECT
                     order_items.qty,
                     order_items.price_cents,
                     order_items.product_id,
                     products.title
                 FROM order_items
                          LEFT JOIN products ON products.id = order_items.product_id
                 WHERE order_items.order_id = $1`,
                [order.id]
            );

            order.items = items.map(item => ({
                ...item,
                quantity: item.qty,
                price: item.price_cents ? (item.price_cents / 100).toFixed(2) : '0'
            }));

            console.log(`Order #${order.id} items:`, order.items);
        }

        console.log('Sending orders to frontend:', orders);
        res.json(orders);

    } catch (err) {
        console.error('Eroare la listMyOrders:', err);
        res.status(500).json({ error: "Eroare la preluarea comenzilor" });
    }
};

//  DETALII COMANDA
exports.getMyOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // luam comanda
        const o = await pool.query(
            `SELECT * FROM orders WHERE id=$1`,
            [id]
        );
        const order = o.rows[0];

        // verificam daca exista
        if (!order || order.user_id !== req.user.uid) {
            return res.status(404).json({ error: 'Comanda nu a fost găsită' });
        }

        // luam prod din comanda
        const items = await pool.query(
            `SELECT * FROM order_items WHERE order_id=$1`,
            [id]
        );

        res.json({ ...order, items: items.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Eroare la preluarea detaliilor comenzii" });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.uid;

        const { rows } = await pool.query(
            'SELECT id, status, user_id FROM orders WHERE id = $1',
            [orderId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Comanda nu a fost găsită' });
        }

        const order = rows[0];
        if (parseInt(order.user_id) !== parseInt(userId)) {

            return res.status(403).json({
                error: 'Nu ai permisiunea să anulezi această comandă'
            });
        }

        console.log('✓ Ownership verified');

        if (!['placed', 'paid'].includes(order.status)) {
            console.log('❌ STATUS NOT ALLOWED');
            return res.status(400).json({
                error: `Nu poți anula această comandă. Status: ${order.status}`
            });
        }

        console.log('✓ Status OK');

        const updateResult = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            ['canceled', orderId]
        );

        console.log('✓ Update successful:', updateResult.rowCount, 'rows');

        if (updateResult.rowCount === 0) {
            return res.status(500).json({ error: 'Eroare la actualizarea comenzii' });
        }

        res.json({
            message: 'Comanda a fost anulată cu succes',
            orderId: orderId,
            newStatus: 'canceled'
        });

    } catch (err) {

        res.status(500).json({
            error: 'Eroare la anularea comenzii'
        });
    }
};