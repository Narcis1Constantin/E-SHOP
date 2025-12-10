const pool = require('../db/pool');

exports.listAll = async (_req, res) => {
    const { rows } = await pool.query(
        `SELECT o.id, u.email, o.total_cents, o.status, o.address, o.created_at
     FROM orders o JOIN users u ON u.id=o.user_id
     ORDER BY o.created_at DESC`
    );
    res.json(rows);
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
