const pool = require("../db/pool");

class OrderService {
    async createOrderTransaction(userId, totalCents, address, items) {
        console.log(`[OrderService] Start tranzacție pentru User ID: ${userId}`);
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Inserare Comandă
            const orderRes = await client.query(
                `INSERT INTO orders (user_id, total_cents, status, address)
                 VALUES ($1, $2, 'placed', $3) RETURNING id`,
                [userId, totalCents, address]
            );
            const orderId = orderRes.rows[0].id;
            console.log(`[OrderService] Comanda creată cu ID: ${orderId}`);

            // 2. Procesare Produse
            for (const it of items) {
                // Conversie explicită pentru siguranță
                const pId = parseInt(it.id);
                const pPrice = it.price ? Math.round(it.price * 100) : 0;
                const pTitle = it.title || 'Produs Generat';
                // Asigurăm valori default pentru coloanele obligatorii
                const pImg = it.thumbnail || it.image_url || '';
                const pCat = it.category || 'general';
                const pBrand = it.brand || 'Generic';

                // --- FIX: CREARE PRODUS DACĂ NU EXISTĂ ---
                try {
                    // Încercăm să inserăm produsul.
                    // ON CONFLICT (id) DO NOTHING înseamnă: "Dacă ID-ul e deja luat, nu fă nimic (nu da eroare)"
                    await client.query(
                        `INSERT INTO products (id, title, price_cents, stock, category, image_url, brand)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                         ON CONFLICT (id) DO NOTHING`,
                        [pId, pTitle, pPrice, 100, pCat, pImg, pBrand]
                    );
                    // Dacă ajunge aici, fie l-a inserat, fie exista deja.
                } catch (prodErr) {
                    console.error(`[OrderService] ATENȚIE: Nu s-a putut crea produsul ${pId}. Motiv:`, prodErr.message);
                    // Continuăm execuția. Dacă inserarea a eșuat critic, eroarea de Foreign Key de mai jos ne va opri oricum.
                }

                // 3. Inserare în Order Items
                console.log(`[OrderService] Adăugare item ${pId} în comandă...`);
                await client.query(
                    `INSERT INTO order_items(order_id, product_id, qty, price_cents)
                     VALUES ($1, $2, $3, $4)`,
                    [orderId, pId, it.quantity, pPrice]
                );
            }

            await client.query('COMMIT');
            console.log(`[OrderService] Tranzacție finalizată cu succes.`);
            return orderId;

        } catch (e) {
            await client.query('ROLLBACK');
            console.error(`[OrderService] EROARE TRANZACȚIE:`, e);
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = new OrderService();