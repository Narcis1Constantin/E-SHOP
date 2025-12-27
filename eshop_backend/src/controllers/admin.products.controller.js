const pool = require('../db/pool');
const ProductBuilder = require('../services/ProductBuilder');

// GET /api/admin/products - lista toate produsele (pentru admin)
exports.list = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT id, title, price_cents, stock, brand, category, image_url, description, created_at
            FROM products
            ORDER BY id DESC
        `);

        // Folosim Builder Pattern
        const products = rows.map(row =>
            new ProductBuilder()
                .setId(row.id)
                .setTitle(row.title)
                .setPriceCents(row.price_cents)
                .setStock(row.stock)
                .setBrand(row.brand)
                .setCategory(row.category)
                .setImageUrl(row.image_url)
                .setDescription(row.description)
                .setCreatedAt(row.created_at)
                .build()
        );

        res.json(products);
    } catch (err) {
        console.error('Eroare la listare produse admin:', err);
        res.status(500).json({ error: 'Eroare internă' });
    }
};

// POST /api/admin/products - creare produs nou
exports.create = async (req, res) => {
    const { title, price_cents, stock = 0, brand, category, image_url, description } = req.body;

    if (!title || price_cents == null) {
        return res.status(400).json({ error: 'Titlu și preț necesare' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO products(title, price_cents, stock, brand, category, image_url, description)
             VALUES($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id, title, price_cents, stock, brand, category, image_url, description, created_at`,
            [title, price_cents, stock, brand, category, image_url, description]
        );

        // Returnăm produsul creat folosind Builder Pattern
        const product = new ProductBuilder()
            .setId(rows[0].id)
            .setTitle(rows[0].title)
            .setPriceCents(rows[0].price_cents)
            .setStock(rows[0].stock)
            .setBrand(rows[0].brand)
            .setCategory(rows[0].category)
            .setImageUrl(rows[0].image_url)
            .setDescription(rows[0].description)
            .setCreatedAt(rows[0].created_at)
            .build();

        res.status(201).json({ ok: true, product });
    } catch (err) {
        console.error('Eroare la creare produs:', err);
        res.status(500).json({ error: 'Eroare la creare produs' });
    }
};

// PUT /api/admin/products/:id - actualizare produs
exports.update = async (req, res) => {
    const { id } = req.params;
    const { title, price_cents, stock, brand, category, image_url, description } = req.body;

    try {
        const { rows, rowCount } = await pool.query(
            `UPDATE products
             SET title = COALESCE($2, title),
                 price_cents = COALESCE($3, price_cents),
                 stock = COALESCE($4, stock),
                 brand = COALESCE($5, brand),
                 category = COALESCE($6, category),
                 image_url = COALESCE($7, image_url),
                 description = COALESCE($8, description)
             WHERE id = $1
                 RETURNING id, title, price_cents, stock, brand, category, image_url, description, created_at`,
            [id, title, price_cents, stock, brand, category, image_url, description]
        );

        if (!rowCount) {
            return res.status(404).json({ error: 'Produs inexistent' });
        }

        // Returnăm produsul actualizat folosind Builder Pattern
        const product = new ProductBuilder()
            .setId(rows[0].id)
            .setTitle(rows[0].title)
            .setPriceCents(rows[0].price_cents)
            .setStock(rows[0].stock)
            .setBrand(rows[0].brand)
            .setCategory(rows[0].category)
            .setImageUrl(rows[0].image_url)
            .setDescription(rows[0].description)
            .setCreatedAt(rows[0].created_at)
            .build();

        res.json({ ok: true, product });
    } catch (err) {
        console.error('Eroare la actualizare produs:', err);
        res.status(500).json({ error: 'Eroare la actualizare produs' });
    }
};

// DELETE /api/admin/products/:id - ștergere produs
exports.remove = async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);

        if (!rowCount) {
            return res.status(404).json({ error: 'Produs inexistent' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('Eroare la ștergere produs:', err);
        res.status(500).json({ error: 'Eroare la ștergere produs' });
    }
};