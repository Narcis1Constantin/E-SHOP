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
                const pQuantity = parseInt(it.quantity) || 1;

                // Asigurăm valori default pentru coloanele obligatorii
                const pImg = it.thumbnail || it.image_url || '';
                const pCat = it.category || 'general';
                const pBrand = it.brand || 'Generic';

                // --- VERIFICARE STOC ÎNAINTE DE COMANDĂ ---
                const stockCheck = await client.query(
                    `SELECT stock FROM products WHERE id = $1`,
                    [pId]
                );

                if (stockCheck.rows.length === 0) {
                    // Produsul nu există - îl creăm
                    console.log(`[OrderService] Produs ${pId} nu există, îl cream...`);
                    try {
                        await client.query(
                            `INSERT INTO products (id, title, price_cents, stock, category, image_url, brand)
                             VALUES ($1, $2, $3, $4, $5, $6, $7)
                             ON CONFLICT (id) DO NOTHING`,
                            [pId, pTitle, pPrice, 100, pCat, pImg, pBrand]
                        );
                    } catch (prodErr) {
                        console.error(`[OrderService] ATENȚIE: Nu s-a putut crea produsul ${pId}. Motiv:`, prodErr.message);
                    }
                } else {
                    // Produsul există - verificăm stocul
                    const currentStock = stockCheck.rows[0].stock;

                    if (currentStock < pQuantity) {
                        throw new Error(`Stoc insuficient pentru produsul ${pTitle}. Disponibil: ${currentStock}, Solicitat: ${pQuantity}`);
                    }

                    console.log(`[OrderService] Produs ${pId}: Stoc curent ${currentStock}, Comandă ${pQuantity}`);
                }

                // 3. Inserare în Order Items
                console.log(`[OrderService] Adăugare item ${pId} în comandă...`);
                await client.query(
                    `INSERT INTO order_items(order_id, product_id, qty, price_cents)
                     VALUES ($1, $2, $3, $4)`,
                    [orderId, pId, pQuantity, pPrice]
                );

                // 4. SCĂDERE AUTOMATĂ DIN STOC
                const updateResult = await client.query(
                    `UPDATE products 
                     SET stock = stock - $1 
                     WHERE id = $2 
                     RETURNING stock`,
                    [pQuantity, pId]
                );

                if (updateResult.rows.length > 0) {
                    const newStock = updateResult.rows[0].stock;
                    console.log(`[OrderService] ✅ Stoc actualizat pentru produsul ${pId}: ${newStock} bucăți rămase`);

                    // Avertizare dacă stocul e scăzut
                    if (newStock <= 5 && newStock > 0) {
                        console.log(`⚠️ ATENȚIE: Stoc scăzut pentru produsul ${pId} (${pTitle}): ${newStock} bucăți`);
                    } else if (newStock === 0) {
                        console.log(`🚫 Produsul ${pId} (${pTitle}) este EPUIZAT!`);
                    }
                }
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