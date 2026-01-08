const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const SALT_ROUNDS = 10;

const nodemailer = require("nodemailer");
const AuthFactory = require("../auth/AuthFactory");
const userService = require("../services/user.service");


// --- TRANSPORT PT EMAIL ---
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, phone, address, password } = req.body;

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { rows } = await client.query(
            `INSERT INTO users (name, email, password_hash, role, phone, address)
       VALUES ($1,$2,$3,'user',$4,$5)
       RETURNING id, role, email, phone`,
            [name, email, hash, phone, address]
        );

        await client.query('INSERT INTO carts(user_id) VALUES($1)', [rows[0].id]);

        await client.query('COMMIT');
        res.status(201).json({ ok: true });
    } catch (e) {
        await client.query('ROLLBACK');
        // duplicate email/phone
        if (e.code === '23505') {
            const field = (e.detail || '').includes('email') ? 'email' : 'phone';
            return res.status(409).json({ error: `Acest ${field} este deja folosit` });
        }
        res.status(400).json({ error: e.message });
    } finally {
        client.release();
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { type, email, phone, password } = req.body;

        const authHandler = AuthFactory.create(type, userService);

        let user;

        if (type === "email") {
            user = await authHandler.login({email, password});
        }
        else if (type === "phone") {
            user = await authHandler.login({phone, password});
        }
        else {
            throw new Error("Tip invalid de autentificare.");
        }

        const token = jwt.sign(
            { uid: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "3h" } // ← 3 ore
        );

        res.json({ token });


    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

exports.verifyCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        const { rows } = await pool.query(
            `SELECT id FROM users
             WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()`,
            [email, code]
        );

        if (!rows.length) {
            return res.status(400).json({ error: "Cod invalid sau expirat" });
        }

        res.json({ ok: true, message: "Cod valid" });
    } catch (err) {
        console.error("Eroare la verificare cod:", err);
        res.status(500).json({ error: "Eroare server" });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;

    try {
        const { rows } = await pool.query(
            `SELECT id FROM users 
             WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()`,
            [email, code]
        );

        if (!rows.length) {
            return res.status(400).json({ error: "Cod invalid sau expirat" });
        }

        const uid = rows[0].id;
        const hash = await bcrypt.hash(newPassword, 10);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                'UPDATE users SET password_hash = $1 WHERE id = $2',
                [hash, uid]
            );

            await client.query(
                'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1',
                [uid]
            );

            await client.query('COMMIT');

            res.json({ ok: true, message: "Parola a fost actualizată" });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Eroare la resetPassword:", err);
        res.status(500).json({ error: "Eroare server" });
    }
};

const crypto = require('crypto');

exports.resetRequest = async (req, res) => {
    const { email } = req.body;

    const { rows } = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (!rows.length) {
        return res.json({ ok: true });
    }

    const uid = rows[0].id;

    // generare cod 6 cifre
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minute

    // stocam in db
    await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
        [resetCode, expires, uid]
    );

    // trimitem email cu codul
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "SmartDepot - Cod resetare parolă",
        html: `
            <h3>Resetare Parolă</h3>
            <p>Codul tău de resetare este:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #3498db;">${resetCode}</h1>
            <p>Codul expiră în 15 minute.</p>
            <p>Dacă nu ai solicitat resetarea, ignoră acest email.</p>
        `
    });

    res.json({ ok: true });
};
