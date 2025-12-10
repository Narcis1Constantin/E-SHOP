const pool = require('../db/pool');
const bcrypt = require("bcrypt");

// GET ACCOUNT
exports.getMyAccount = async (req, res) => {
    const userId = req.user.uid;   // <-- FIXED

    const uRes = await pool.query(
        `SELECT *
         FROM users 
         WHERE id = $1`,
        [userId]
    );

    const user = uRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User inexistent' });

    const oRes = await pool.query(
        `SELECT COALESCE(SUM(total_cents), 0) AS total
         FROM orders
         WHERE user_id = $1
           AND status IN ('paid', 'delivered')`,
        [userId]
    );

    const totalLei = Number(oRes.rows[0].total) / 100;
    const points = totalLei;

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        totalSpentLei: totalLei,
        points,
        canBecomePremium: points >= 1000,
        pointsToGo: Math.max(0, 1000 - points)
    });
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
    const { uid } = req.user;
    const { name, phone, address, email, password } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    if (name !== undefined) {
        fields.push(`name = $${i++}`);
        values.push(name);
    }

    if (email !== undefined) {
        fields.push(`email = $${i++}`);
        values.push(email);
    }

    if (phone !== undefined) {
        fields.push(`phone = $${i++}`);
        values.push(phone);
    }

    if (address !== undefined) {
        fields.push(`address = $${i++}`);
        values.push(address);
    }

    if (password) {
        const hash = await bcrypt.hash(password, 10);
        fields.push(`password_hash = $${i++}`);
        values.push(hash);
    }

    if (!fields.length) {
        return res.status(400).json({ error: 'Nu ai trimis niciun câmp de actualizat' });
    }

    values.push(uid);

    const { rows } = await pool.query(
        `UPDATE users
         SET ${fields.join(', ')}
         WHERE id = $${i}
         RETURNING id, name, email, phone, address, role`,
        values
    );

    res.json({ ok: true, user: rows[0] });
};

// UPGRADE TO PREMIUM
exports.upgradeToPremium = async (req, res) => {
    const userId = req.user.uid;

    const oRes = await pool.query(
        `SELECT COALESCE(SUM(total_cents), 0) AS total
         FROM orders
         WHERE user_id = $1
           AND status IN ('paid', 'delivered')`,
        [userId]
    );

    const points = Number(oRes.rows[0].total) / 100;

    if (points < 10000) {
        return res.status(400).json({
            error: 'Nu ai suficiente puncte pentru cont premium',
            points,
            needed: 10000 - points
        });
    }

    await pool.query(
        `UPDATE users SET role = 'premium' WHERE id = $1`,
        [userId]
    );

    res.json({
        ok: true,
        message: 'Contul a fost actualizat la PREMIUM',
        newRole: 'premium',
        points
    });
};
