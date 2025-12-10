const pool = require('../db/pool');

exports.list = async (req, res) => {
    const { q, category, page=1, limit=12 } = req.query;
    const off = (Math.max(parseInt(page),1)-1) * Math.max(parseInt(limit),1);

    const parts = [];
    const vals = [];
    let i = 1;

    if (q) { parts.push(`title ILIKE $${i++}`); vals.push(`%${q}%`); }
    if (category) { parts.push(`category = $${i++}`); vals.push(category); }

    const where = parts.length ? `WHERE ${parts.join(' AND ')}` : '';
    const sql = `
    SELECT id,title,price_cents,stock,brand,category,image_url
    FROM products
    ${where}
    ORDER BY id DESC
    LIMIT ${Math.max(parseInt(limit),1)} OFFSET ${off}
  `;
    const { rows } = await pool.query(sql, vals);
    res.json(rows);
};
