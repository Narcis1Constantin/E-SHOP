const pool = require('../db/pool');

// toate recenziile unui produs
exports.getProductReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.created_at,
                    u.name as user_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = $1
             ORDER BY r.created_at DESC`,
            [productId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Eroare la încărcarea recenziilor:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// adauga recenzie
exports.addReview = async (req, res) => {
    const { productId } = req.params;
    const { uid } = req.user; // din middleware requireAuth
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating invalid (1-5)' });
    }

    if (!comment || comment.trim().length < 10) {
        return res.status(400).json({ error: 'Comentariul trebuie să aibă minim 10 caractere' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO reviews (product_id, user_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             RETURNING id, rating, comment, created_at`,
            [productId, uid, rating, comment.trim()]
        );

        res.status(201).json({ ok: true, review: rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ai lăsat deja o recenzie pentru acest produs' });
        }
        console.error('Eroare la adăugarea recenziei:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// sterge recenzie (ADMIN)
exports.deleteReview = async (req, res) => {
    const { reviewId } = req.params;

    try {
        const { rowCount } = await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

        if (!rowCount) {
            return res.status(404).json({ error: 'Recenzie negăsită' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('Eroare la ștergerea recenziei:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};