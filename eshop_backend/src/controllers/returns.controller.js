const pool = require('../db/pool');
const nodemailer = require('nodemailer');
const PaymentService = require('../services/PaymentService');

// Configurare email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// POST /api/returns - Creare cerere retur (USER)
exports.createReturn = async (req, res) => {
    const userId = req.user.uid;
    const { orderId, reason, details } = req.body;

    // Validare
    if (!orderId || !reason) {
        return res.status(400).json({ error: 'Date incomplete' });
    }

    const validReasons = ['defect', 'mismatch', 'changed_mind', 'other'];
    if (!validReasons.includes(reason)) {
        return res.status(400).json({ error: 'Motiv invalid' });
    }

    try {
        // Verifică dacă comanda aparține user-ului
        const { rows: orders } = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [orderId, userId]
        );

        console.log('🔍 Verificare comandă:', { orderId, userId, found: orders.length });

        if (!orders.length) {
            return res.status(404).json({ error: 'Comandă inexistentă sau nu îți aparține' });
        }

        const order = orders[0];

        // Verifică dacă nu există deja o cerere de retur pentru această comandă
        const { rows: existingReturns } = await pool.query(
            'SELECT * FROM order_returns WHERE order_id = $1',
            [orderId]
        );

        if (existingReturns.length > 0) {
            return res.status(400).json({ error: 'Există deja o cerere de retur pentru această comandă' });
        }

        // Creează cererea de retur
        const { rows: returns } = await pool.query(
            `INSERT INTO order_returns (order_id, user_id, reason, details, status)
             VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
            [orderId, userId, reason, details, 'pending']
        );

        // Actualizează statusul comenzii
        await pool.query(
            `UPDATE orders SET return_status = $1 WHERE id = $2`,
            ['requested', orderId]
        );

        // Trimite email de confirmare
        const { rows: users } = await pool.query(
            'SELECT email, name FROM users WHERE id = $1',
            [userId]
        );

        if (users.length > 0) {
            const user = users[0];
            const reasonText = {
                'defect': 'Produs defect',
                'mismatch': 'Nu corespunde descrierii',
                'changed_mind': 'Am schimbat decizia',
                'other': 'Altul'
            };

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: `Confirmare cerere retur - Comanda #${orderId}`,
                html: `
                    <h2>Cerere de retur înregistrată</h2>
                    <p>Bună ${user.name},</p>
                    <p>Cererea ta de retur pentru comanda #${orderId} a fost înregistrată cu succes.</p>
                    <p><strong>Motiv:</strong> ${reasonText[reason]}</p>
                    ${details ? `<p><strong>Detalii:</strong> ${details}</p>` : ''}
                    <p>Vei primi un răspuns în maxim 24-48 ore.</p>
                    <p>Mulțumim!</p>
                `
            }).catch(err => console.error('Eroare trimitere email:', err));
        }

        res.status(201).json({
            ok: true,
            return: returns[0],
            message: 'Cerere de retur înregistrată cu succes'
        });
    } catch (err) {
        console.error('Eroare la creare retur:', err);
        res.status(500).json({ error: 'Eroare la înregistrarea returului' });
    }
};

// GET /api/returns/my - Retururile utilizatorului curent
exports.getMyReturns = async (req, res) => {
    const userId = req.user.uid;

    try {
        const { rows } = await pool.query(
            `SELECT
                 r.*,
                 o.total_cents,
                 o.created_at as order_date
             FROM order_returns r
                      JOIN orders o ON o.id = r.order_id
             WHERE r.user_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Eroare la listare retururi:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// GET /api/admin/returns - Lista toate retururile (ADMIN)
exports.listAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT
                 r.*,
                 u.name as user_name,
                 u.email as user_email,
                 o.total_cents,
                 o.created_at as order_date
             FROM order_returns r
                      JOIN users u ON u.id = r.user_id
                      JOIN orders o ON o.id = r.order_id
             ORDER BY r.created_at DESC`
        );

        res.json(rows);
    } catch (err) {
        console.error('Eroare la listare retururi:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// GET /api/admin/returns/:id - Detalii retur (ADMIN)
exports.getById = async (req, res) => {
    const { id } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT
                 r.*,
                 u.name as user_name,
                 u.email as user_email,
                 u.phone as user_phone,
                 o.total_cents,
                 o.address,
                 o.created_at as order_date
             FROM order_returns r
                      JOIN users u ON u.id = r.user_id
                      JOIN orders o ON o.id = r.order_id
             WHERE r.id = $1`,
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'Retur inexistent' });
        }

        const returnData = rows[0];

        // Luăm și produsele din comandă
        const { rows: items } = await pool.query(
            `SELECT oi.qty as quantity, oi.price_cents,
                    ROUND(oi.price_cents / 100.0, 2) as price,
                    p.title
             FROM order_items oi
                      LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = $1`,
            [returnData.order_id]
        );

        res.json({ ...returnData, items });
    } catch (err) {
        console.error('Eroare la încărcare detalii retur:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// PUT /api/admin/returns/:id - Actualizare status retur (ADMIN) + REFUND AUTOMAT
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status invalid' });
    }

    try {
        // 1. Obținem datele returului
        const { rows: returnRows } = await pool.query(
            `SELECT r.*, o.payment_intent_id, o.total_cents
             FROM order_returns r
                      JOIN orders o ON o.id = r.order_id
             WHERE r.id = $1`,
            [id]
        );

        if (!returnRows.length) {
            return res.status(404).json({ error: 'Retur inexistent' });
        }

        const returnData = returnRows[0];
        const paymentIntentId = returnData.payment_intent_id;

        // 2. Dacă statusul e "approved" și avem payment_intent_id, facem REFUND AUTOMAT
        if (status === 'approved' && paymentIntentId) {
            console.log(`💰 Inițiere refund pentru comanda #${returnData.order_id}, Payment Intent: ${paymentIntentId}`);

            try {
                // Facem refund prin Stripe
                const refundResult = await PaymentService.createRefund(paymentIntentId, returnData.total_cents);

                console.log(`✅ Refund reușit: ${refundResult.refundId}, Status: ${refundResult.status}`);

                // Dacă refund-ul e successful, schimbăm automat statusul în "completed"
                if (refundResult.status === 'succeeded') {
                    console.log(`🎉 Refund confirmat! Schimbăm status în "completed"`);

                    // Actualizăm returul la "completed"
                    await pool.query(
                        `UPDATE order_returns 
                         SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
                         WHERE id = $3`,
                        ['completed', adminNotes + `\n\n[Refund automat: ${refundResult.refundId}]`, id]
                    );

                    // Actualizăm și statusul returului în orders
                    await pool.query(
                        `UPDATE orders SET return_status = $1 WHERE id = $2`,
                        ['completed', returnData.order_id]
                    );

                    // Trimitem email de finalizare
                    const { rows: users } = await pool.query(
                        'SELECT email, name FROM users WHERE id = $1',
                        [returnData.user_id]
                    );

                    if (users.length > 0) {
                        const user = users[0];

                        await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: user.email,
                            subject: `Retur finalizat - Comanda #${returnData.order_id}`,
                            html: `
                                <h2>Returul tău a fost finalizat!</h2>
                                <p>Bună ${user.name},</p>
                                <p>Returul pentru comanda #${returnData.order_id} a fost <strong>finalizat cu succes</strong>.</p>
                                <p>💰 Suma de <strong>${(returnData.total_cents / 100).toFixed(2)} Lei</strong> a fost rambursată.</p>
                                <p>Banii vor apărea în contul tău în 5-10 zile lucrătoare.</p>
                                ${adminNotes ? `<p><strong>Notițe:</strong> ${adminNotes}</p>` : ''}
                                <p>Mulțumim!</p>
                            `
                        }).catch(err => console.error('Eroare trimitere email:', err));
                    }

                    return res.json({
                        ok: true,
                        message: 'Retur aprobat și refund efectuat automat!',
                        refundId: refundResult.refundId
                    });
                }

            } catch (refundError) {
                console.error('❌ Eroare la refund Stripe:', refundError);
                // Continuăm cu aprobare manuală dacă refund-ul eșuează
                // Admin poate finaliza manual mai târziu
            }
        }

        // 3. Dacă NU e "approved" SAU NU are payment_intent_id, update normal
        const { rows, rowCount } = await pool.query(
            `UPDATE order_returns 
             SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [status, adminNotes, id]
        );

        if (!rowCount) {
            return res.status(404).json({ error: 'Retur inexistent' });
        }

        // Actualizăm și statusul returului în orders
        await pool.query(
            `UPDATE orders SET return_status = $1 WHERE id = $2`,
            [status, returnData.order_id]
        );

        // Trimite email către client cu update-ul
        const { rows: users } = await pool.query(
            'SELECT email, name FROM users WHERE id = $1',
            [returnData.user_id]
        );

        if (users.length > 0) {
            const user = users[0];
            const statusText = {
                'pending': 'în așteptare',
                'approved': 'aprobată',
                'rejected': 'respinsă',
                'completed': 'finalizată'
            };

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: `Update cerere retur - Comanda #${returnData.order_id}`,
                html: `
                    <h2>Update cerere de retur</h2>
                    <p>Bună ${user.name},</p>
                    <p>Cererea ta de retur pentru comanda #${returnData.order_id} a fost <strong>${statusText[status]}</strong>.</p>
                    ${adminNotes ? `<p><strong>Notițe:</strong> ${adminNotes}</p>` : ''}
                    ${status === 'approved' ? '<p>Vei primi instrucțiuni pentru returnarea produsului în curând.</p>' : ''}
                    <p>Mulțumim!</p>
                `
            }).catch(err => console.error('Eroare trimitere email:', err));
        }

        res.json({ ok: true, return: rows[0] });
    } catch (err) {
        console.error('Eroare la actualizare retur:', err);
        res.status(500).json({ error: 'Eroare la actualizare' });
    }
};

// DELETE /api/admin/returns/:id - Ștergere retur (ADMIN)
exports.deleteReturn = async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await pool.query(
            'DELETE FROM order_returns WHERE id = $1',
            [id]
        );

        if (!rowCount) {
            return res.status(404).json({ error: 'Retur inexistent' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('Eroare la ștergere retur:', err);
        res.status(500).json({ error: 'Eroare la ștergere' });
    }
};