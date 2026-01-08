const pool = require('../db/pool');

// trimite cerere de finanțare
exports.applyForFinancing = async (req, res) => {
    const userId = req.user.id;
    const {
        fullName,
        email,
        phone,
        cnp,
        monthlyIncome,
        amount,
        months,
        monthlyRate,
        totalAmount,
        interestRate
    } = req.body;

    // validare
    if (!cnp || !monthlyIncome || !amount || !months) {
        return res.status(400).json({ error: 'Date incomplete' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO financing_applications 
            (user_id, full_name, email, phone, cnp, monthly_income, amount, months, monthly_rate, total_amount, interest_rate, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id, created_at`,
            [userId, fullName, email, phone, cnp, monthlyIncome, amount, months, monthlyRate, totalAmount, interestRate, 'pending']
        );

        res.status(201).json({
            ok: true,
            applicationId: rows[0].id,
            message: 'Cererea a fost înregistrată cu succes'
        });
    } catch (err) {
        console.error('Eroare la creare cerere finanțare:', err);
        res.status(500).json({ error: 'Eroare la înregistrarea cererii' });
    }
};

// GET /api/admin/financing - Lista toate cererile (ADMIN)
exports.listAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT 
                fa.*,
                u.name as user_name,
                u.email as user_email
            FROM financing_applications fa
            LEFT JOIN users u ON fa.user_id = u.id
            ORDER BY fa.created_at DESC`
        );

        res.json(rows);
    } catch (err) {
        console.error('Eroare la listare cereri finanțare:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// cererile utilizatorului curent
exports.myApplications = async (req, res) => {
    const userId = req.user.id;

    try {
        const { rows } = await pool.query(
            `SELECT * FROM financing_applications 
            WHERE user_id = $1 
            ORDER BY created_at DESC`,
            [userId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Eroare la listare cereri utilizator:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// PUT /api/admin/financing/:id - Actualizare status cerere (ADMIN)
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status invalid' });
    }

    try {
        const { rows, rowCount } = await pool.query(
            `UPDATE financing_applications 
            SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *`,
            [status, notes, id]
        );

        if (!rowCount) {
            return res.status(404).json({ error: 'Cerere inexistentă' });
        }

        res.json({ ok: true, application: rows[0] });
    } catch (err) {
        console.error('Eroare la actualizare cerere:', err);
        res.status(500).json({ error: 'Eroare la actualizare' });
    }
};

// stergere cerere (ADMIN)
exports.deleteApplication = async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await pool.query(
            'DELETE FROM financing_applications WHERE id = $1',
            [id]
        );

        if (!rowCount) {
            return res.status(404).json({ error: 'Cerere inexistentă' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('Eroare la ștergere cerere:', err);
        res.status(500).json({ error: 'Eroare la ștergere' });
    }
};