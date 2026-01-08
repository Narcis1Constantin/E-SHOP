const pool = require('../db/pool');

exports.getMe = async (req, res) => {
    try {
        const { uid } = req.user;

        const { rows } = await pool.query(
            `SELECT id, name, email, phone, address, role, created_at 
             FROM users 
             WHERE id = $1`,
            [uid]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'Utilizator negăsit' });
        }
        const { rows: orderTotal } = await pool.query(
            `SELECT COALESCE(SUM(total_cents), 0) as total_spent_cents
             FROM orders
             WHERE user_id = $1 
             AND TRIM(status) = 'placed'`,
            [uid]
        );

        const user = rows[0];
        user.total_spent = orderTotal[0].total_spent_cents / 100; // în lei
        user.points = Math.floor(user.total_spent); // 1 leu = 1 punct

        console.log(`[Account] User ${uid} - Total spent: ${user.total_spent} lei, Points: ${user.points}`);

        res.json({ user });
    } catch (err) {
        console.error('Eroare la getMe:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// PUT /api/account/me - actualizează datele user-ului curent
exports.updateMe = async (req, res) => {
    try {
        const { uid } = req.user;
        const { name, phone, address, password } = req.body;

        // Dacă se schimbă parola
        if (password) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);

            await pool.query(
                `UPDATE users 
                 SET password_hash = $2
                 WHERE id = $1`,
                [uid, hashedPassword]
            );

            return res.json({ ok: true, message: 'Parola a fost schimbată cu succes!' });
        }

        // altfel, actualizează profilul
        const { rows } = await pool.query(
            `UPDATE users 
             SET name = COALESCE($2, name),
                 phone = COALESCE($3, phone),
                 address = COALESCE($4, address)
             WHERE id = $1
             RETURNING id, name, email, phone, address, role`,
            [uid, name, phone, address]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'Utilizator negăsit' });
        }

        res.json({ ok: true, user: rows[0] });
    } catch (err) {
        console.error('Eroare la updateMe:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};