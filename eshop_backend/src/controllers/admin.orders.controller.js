const pool = require('../db/pool');

exports.listAll = async (_req, res) => {
    const { rows } = await pool.query(
        `SELECT o.id, u.email, o.total_cents, o.status, o.address, o.created_at
     FROM orders o JOIN users u ON u.id=o.user_id
     ORDER BY o.created_at DESC`
    );
    res.json(rows);
};


exports.getMine = async (req, res) => {
    try {
        const userId = req.user.id; // din JWT middleware

        // 1. Luăm toate comenzile utilizatorului cu TOATE coloanele
        const { rows: orders } = await pool.query(
            `SELECT * FROM orders 
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        // 2. Pentru fiecare comandă:
        // - Calculăm totalul în lei
        // - Încercăm să luăm produsele din order_items (dacă există tabelul)
        for (let order of orders) {
            // Convertim total_cents în total (lei)
            if (order.total_cents) {
                order.total = Math.round(order.total_cents / 100 * 100) / 100;
            }

            // Încercăm să luăm produsele
            try {
                const { rows: items } = await pool.query(
                    `SELECT oi.quantity, oi.price_cents,
                            ROUND(oi.price_cents / 100.0, 2) as price,
                            p.title as product_title,
                            p.title as title
                     FROM order_items oi
                     LEFT JOIN products p ON p.id = oi.product_id
                     WHERE oi.order_id = $1`,
                    [order.id]
                );
                order.items = items || [];
            } catch (err) {
                // Dacă tabelul order_items nu există sau alte erori
                console.log(`Nu s-au putut încărca produsele pentru comanda ${order.id}:`, err.message);
                order.items = [];
            }
        }

        console.log('Orders sent to frontend:', JSON.stringify(orders, null, 2));
        res.json(orders);
    } catch (err) {
        console.error('Eroare la listarea comenzilor:', err);
        res.status(500).json({ error: 'Eroare server' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // placed|paid|shipped|delivered|canceled
    const allowed = new Set(['placed','paid','shipped','delivered','canceled']);
    if (!allowed.has(status)) return res.status(400).json({ error: 'Status invalid' });

    const { rowCount } = await pool.query(
        `UPDATE orders SET status=$2 WHERE id=$1`, [id, status]
    );
    if (!rowCount) return res.status(404).json({ error: 'Comandă inexistentă' });
    res.json({ ok: true });
};
