const pool = require('../db/pool');

exports.listAll = async (_req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT o.id, u.email, o.total_cents, o.status, o.return_status, o.address, o.created_at
             FROM orders o
                      JOIN users u ON u.id=o.user_id
             ORDER BY o.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('listAll admin orders error:', err);
        res.status(500).json({ error: 'Eroare server' });
    }
};

// ✅ NOU: detalii comandă + items (fără crash)
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT o.*, u.email
             FROM orders o
                      JOIN users u ON u.id = o.user_id
             WHERE o.id = $1`,
            [id]
        );

        if (!rows.length) return res.status(404).json({ error: 'Comandă inexistentă' });

        const order = rows[0];

        // încercăm să luăm produsele; dacă e problemă, nu crăpăm
        try {
            const { rows: items } = await pool.query(
                `SELECT oi.quantity,
                        oi.price_cents,
                        ROUND(oi.price_cents / 100.0, 2) as price,
                        p.title as title
                 FROM order_items oi
                          LEFT JOIN products p ON p.id = oi.product_id
                 WHERE oi.order_id = $1`,
                [id]
            );
            order.items = items || [];
        } catch (errItems) {
            console.log(`Nu s-au putut încărca produsele pentru comanda ${id}:`, errItems.message);
            order.items = [];
        }

        res.json(order);
    } catch (err) {
        console.error('getById admin orders error:', err);
        res.status(500).json({ error: 'Eroare server' });
    }
};

// ✅ DOAR placed / paid
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowed = new Set(['placed', 'paid']);
        if (!allowed.has(status)) return res.status(400).json({ error: 'Status invalid' });

        const { rowCount } = await pool.query(
            `UPDATE orders SET status=$2 WHERE id=$1`,
            [id, status]
        );

        if (!rowCount) return res.status(404).json({ error: 'Comandă inexistentă' });
        res.json({ ok: true });
    } catch (err) {
        console.error('updateStatus admin orders error:', err);
        res.status(500).json({ error: 'Eroare server' });
    }
};

// ✅ Detalii comandă (VERSIUNEA CORECTATĂ - fără duplicate)
exports.getById = async (req, res) => {
    const { id } = req.params;

    try {
        // 🔹 Comanda + user
        const { rows } = await pool.query(
            `SELECT o.*, u.email
             FROM orders o
                      JOIN users u ON u.id = o.user_id
             WHERE o.id = $1`,
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'Comandă inexistentă' });
        }

        const order = rows[0];

        // 🔹 Produse comandate (QUERY CORECT PENTRU TABELA TA)
        let items = [];
        try {
            const itemsRes = await pool.query(
                `SELECT
                     oi.qty,
                     oi.price_cents,
                     ROUND(oi.price_cents / 100.0, 2) AS price,
                     p.title
                 FROM order_items oi
                          JOIN products p ON p.id = oi.product_id
                 WHERE oi.order_id = $1`,
                [id]
            );

            items = itemsRes.rows;
        } catch (err) {
            console.warn('⚠️ Produsele nu au putut fi încărcate:', err.message);
        }

        order.items = items;

        res.json(order);

    } catch (err) {
        console.error('❌ Eroare detalii comandă:', err);
        res.status(500).json({ error: 'Eroare server' });
    }
};