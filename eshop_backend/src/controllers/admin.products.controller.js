const pool = require('../db/pool');

exports.create = async (req, res) => {
    const { title, price_cents, stock=0, brand, category, image_url } = req.body;
    if (!title || price_cents == null) return res.status(400).json({ error: 'Titlu și preț necesare' });

    const { rows } = await pool.query(
        `INSERT INTO products(title, price_cents, stock, brand, category, image_url)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
        [title, price_cents, stock, brand, category, image_url]
    );
    res.status(201).json({ ok: true, id: rows[0].id });
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { title, price_cents, stock, brand, category, image_url } = req.body;

    const { rowCount } = await pool.query(
        `UPDATE products
     SET title=COALESCE($2,title),
         price_cents=COALESCE($3,price_cents),
         stock=COALESCE($4,stock),
         brand=COALESCE($5,brand),
         category=COALESCE($6,category),
         image_url=COALESCE($7,image_url)
     WHERE id=$1`,
        [id, title, price_cents, stock, brand, category, image_url]
    );
    if (!rowCount) return res.status(404).json({ error: 'Produs inexistent' });
    res.json({ ok: true });
};

exports.remove = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM products WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Produs inexistent' });
    res.json({ ok: true });
};
