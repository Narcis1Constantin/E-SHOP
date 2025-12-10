const pool = require('../db/pool');

exports.getCart = async (req,res) => {
    const { rows } = await pool.query(
        `SELECT ci.product_id, ci.qty, p.title, p.price_cents, p.image_url
     FROM carts c
     LEFT JOIN cart_items ci ON ci.cart_id=c.id
     LEFT JOIN products p ON p.id=ci.product_id
     WHERE c.user_id=$1`, [req.user.uid]
    );
    res.json(rows.filter(Boolean));
};

exports.upsertItem = async (req,res) => {
    const { productId, qty } = req.body;
    const c = await pool.connect();
    try {
        await c.query('BEGIN');
        const cart = await c.query('SELECT id FROM carts WHERE user_id=$1',[req.user.uid]);
        const cartId = cart.rows[0].id;
        await c.query(
            `INSERT INTO cart_items(cart_id,product_id,qty)
       VALUES($1,$2,$3)
       ON CONFLICT (cart_id,product_id) DO UPDATE SET qty=EXCLUDED.qty`,
            [cartId, productId, qty]
        );
        await c.query('COMMIT');
        res.json({ ok:true });
    } catch(e){ await c.query('ROLLBACK'); res.status(400).json({ error:e.message }); }
    finally { c.release(); }
};
