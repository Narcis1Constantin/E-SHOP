const pool = require('../db/pool');

// GET /api/account/me - returnează datele user-ului curent
exports.getMe = async (req, res) => {
    try {
        // req.user vine din middleware-ul requireAuth (contine { uid, role })
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

        // Nu trimitem password_hash, reset_token, etc.
        res.json({ user: rows[0] });
    } catch (err) {
        console.error('Eroare la getMe:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// PUT /api/account/me - actualizează datele user-ului curent
exports.updateMe = async (req, res) => {
    try {
        const { uid } = req.user;
        const { name, phone, address } = req.body;

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