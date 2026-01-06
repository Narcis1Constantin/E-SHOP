const pool = require('../db/pool');
const ProductBuilder = require('../services/ProductBuilder');

exports.list = async (req, res) => {
    const { q, category, page = 1, limit = 12 } = req.query;
    const off = (Math.max(parseInt(page),1)-1) * Math.max(parseInt(limit),1);

    const parts = [];
    const vals = [];
    let i = 1;

    if (q) { parts.push(`title ILIKE $${i++}`); vals.push(`%${q}%`); }
    if (category) { parts.push(`category = $${i++}`); vals.push(category); }

    const where = parts.length ? `WHERE ${parts.join(' AND ')}` : '';

    const sql = `
        SELECT
            id,
            title,
            price_cents,
            stock,
            brand,
            category,
            image_url,
            discount_percentage,
            is_refurbished,
            created_at
        FROM products
                 ${where}
        ORDER BY id DESC
            LIMIT ${limit} OFFSET ${off}
    `;

    const { rows } = await pool.query(sql, vals);

    const products = rows.map(row =>
        new ProductBuilder()
            .setId(row.id)
            .setTitle(row.title)
            .setPriceCents(row.price_cents)
            .setStock(row.stock)
            .setBrand(row.brand)
            .setCategory(row.category)
            .setImageUrl(row.image_url)
            .setDiscountPercentage(row.discount_percentage)
            .setIsRefurbished(row.is_refurbished)
            .setCreatedAt(row.created_at)
            .build()
    );

    res.json(products);
};