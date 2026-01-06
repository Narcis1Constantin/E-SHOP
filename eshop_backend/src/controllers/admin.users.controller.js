const pool = require('../db/pool');

// GET /api/admin/users - Lista toți utilizatorii
exports.listAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.address,
                u.role,
                u.created_at,
                COUNT(DISTINCT o.id) as total_orders,
                COUNT(DISTINCT r.id) as total_reviews,
                COUNT(DISTINCT fa.id) as total_financing_applications
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            LEFT JOIN reviews r ON r.user_id = u.id
            LEFT JOIN financing_applications fa ON fa.user_id = u.id
            GROUP BY u.id
            ORDER BY u.created_at DESC`
        );

        res.json(rows);
    } catch (err) {
        console.error('Eroare la listare utilizatori:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// GET /api/admin/users/:id - Detalii utilizator specific
exports.getById = async (req, res) => {
    const { id } = req.params;

    try {
        // Date utilizator
        const { rows: users } = await pool.query(
            `SELECT id, name, email, phone, address, role, created_at
             FROM users WHERE id = $1`,
            [id]
        );

        if (!users.length) {
            return res.status(404).json({ error: 'Utilizator inexistent' });
        }

        const user = users[0];

        // Comenzile utilizatorului
        const { rows: orders } = await pool.query(
            `SELECT id, total_cents, status, created_at
             FROM orders WHERE user_id = $1
             ORDER BY created_at DESC`,
            [id]
        );

        // Recenziile utilizatorului
        const { rows: reviews } = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, p.title as product_title
             FROM reviews r
             LEFT JOIN products p ON p.id = r.product_id
             WHERE r.user_id = $1
             ORDER BY r.created_at DESC`,
            [id]
        );

        // Cererile de finanțare
        const { rows: financing } = await pool.query(
            `SELECT id, amount, months, status, created_at
             FROM financing_applications WHERE user_id = $1
             ORDER BY created_at DESC`,
            [id]
        );

        res.json({
            user,
            orders,
            reviews,
            financing
        });
    } catch (err) {
        console.error('Eroare la încărcare detalii utilizator:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// PUT /api/admin/users/:id/role - Actualizare rol utilizator
exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Rol invalid' });
    }

    try {
        const { rows, rowCount } = await pool.query(
            `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
            [role, id]
        );

        if (!rowCount) {
            return res.status(404).json({ error: 'Utilizator inexistent' });
        }

        res.json({ ok: true, user: rows[0] });
    } catch (err) {
        console.error('Eroare la actualizare rol:', err);
        res.status(500).json({ error: 'Eroare la actualizare' });
    }
};

// DELETE /api/admin/users/:id - Ștergere utilizator
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await pool.query(
            'DELETE FROM users WHERE id = $1',
            [id]
        );

        if (!rowCount) {
            return res.status(404).json({ error: 'Utilizator inexistent' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('Eroare la ștergere utilizator:', err);
        res.status(500).json({ error: 'Eroare la ștergere' });
    }
};

// GET /api/admin/stats - Statistici generale
exports.getStats = async (req, res) => {
    try {
        // Număr utilizatori
        const { rows: usersCount } = await pool.query('SELECT COUNT(*) as count FROM users');

        // Număr comenzi
        const { rows: ordersCount } = await pool.query('SELECT COUNT(*) as count FROM orders');

        // Total vânzări (în lei)
        const { rows: totalSales } = await pool.query(
            'SELECT COALESCE(SUM(total_cents), 0) as total FROM orders WHERE status != $1',
            ['canceled']
        );

        // Număr produse
        const { rows: productsCount } = await pool.query('SELECT COUNT(*) as count FROM products');

        res.json({
            totalUsers: parseInt(usersCount[0].count),
            totalOrders: parseInt(ordersCount[0].count),
            totalSales: Math.round(totalSales[0].total / 100 * 100) / 100,
            totalProducts: parseInt(productsCount[0].count)
        });
    } catch (err) {
        console.error('Eroare la încărcare statistici:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};