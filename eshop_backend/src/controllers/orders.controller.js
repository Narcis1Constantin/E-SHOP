const pool = require('../db/pool');
const nodemailer = require("nodemailer");

// Configurare Email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.placeOrder = async (req, res) => {
    // 1. PRIMIM 'items' DIN FRONTEND
    const { address, email, paymentMethod, items } = req.body;

    if (!address || address.trim().length < 5) {
        return res.status(400).json({ error: 'Adresă invalidă' });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Coșul este gol' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 2. CALCULĂM TOTALUL
        let total = 0;
        for (const it of items) {
            total += (Number(it.price) || 0) * it.quantity;
        }
        const totalCents = Math.round(total * 100);

        // 3. SALVĂM COMANDA
        const orderRes = await client.query(
            `INSERT INTO orders (user_id, total_cents, status, address)
             VALUES ($1, $2, 'placed', $3) RETURNING id, created_at`,
            [req.user.uid, totalCents, address]
        );
        const orderId = orderRes.rows[0].id;

        // 4. SALVĂM PRODUSELE (Ignorăm erori de foreign key pt produse externe)
        for (const it of items) {
            try {
                await client.query(
                    `INSERT INTO order_items(order_id, product_id, qty, price_cents)
                     VALUES ($1, $2, $3, $4)`,
                    [orderId, it.id, it.quantity, Math.round(it.price * 100)]
                );
            } catch (err) {
                console.log(`Produsul ${it.id} nu a putut fi salvat în DB (extern).`);
            }
        }

        await client.query('COMMIT');

        // 5. TRIMITEM EMAIL
        try {
            const productsList = items.map(i =>
                `<li>${i.title} x${i.quantity} - ${(i.price * i.quantity).toFixed(2)} Lei</li>`
            ).join('');

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Confirmare Comandă #${orderId}`,
                html: `
                    <h3>Salut! Comanda ta a fost înregistrată.</h3>
                    <p><strong>Adresă:</strong> ${address}</p>
                    <p><strong>Total:</strong> ${total.toFixed(2)} Lei</p>
                    <ul>${productsList}</ul>
                `
            });
        } catch (mailErr) {
            console.error("Eroare email:", mailErr);
        }

        res.status(201).json({ ok: true, orderId });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        res.status(500).json({ error: e.message });
    } finally {
        client.release();
    }
};

exports.listMyOrders = async (req, res) => {
    const { rows } = await pool.query(
        `SELECT id, total_cents, status, created_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC`,
        [req.user.uid]
    );
    res.json(rows);
};

exports.getMyOrder = async (req, res) => {
    const { id } = req.params;
    const o = await pool.query(`SELECT * FROM orders WHERE id=$1`, [id]);
    const order = o.rows[0];
    if (!order || order.user_id !== req.user.uid) return res.status(404).json({ error: 'Not found' });
    const items = await pool.query(`SELECT * FROM order_items WHERE order_id=$1`, [id]);
    res.json({ ...order, items: items.rows });
};