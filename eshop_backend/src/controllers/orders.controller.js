const CheckoutFacade = require('../facades/CheckoutFacade');
const pool = require('../db/pool');

// --- 1. COMANDĂ NOUĂ (Foloseste Facade) ---
exports.placeOrder = async (req, res) => {
    try {
        // Delegăm întreaga logică complexă (validare, calcul, DB, email) către Facade
        const result = await CheckoutFacade.placeOrder(req.user, req.body);

        // Returnăm succes către client
        res.status(201).json({
            ok: true,
            orderId: result.orderId,
            message: "Comanda a fost plasată cu succes!"
        });

    } catch (e) {
        console.error("Eroare în placeOrder Controller:", e);

        // Gestionăm erorile cunoscute vs erori de server
        let status = 500;
        if (e.message === 'Coșul este gol' || e.message === 'Adresă lipsă') {
            status = 400;
        }

        res.status(status).json({ error: e.message });
    }
};

// --- 2. LISTARE COMENZI (Cu produsele din order_items) ---
exports.listMyOrders = async (req, res) => {
    try {
        console.log('listMyOrders - req.user:', req.user);

        // 1. Obține comenzile utilizatorului
        const { rows: orders } = await pool.query(
            `SELECT id, total_cents, status, address, created_at, payment_ref
             FROM orders 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [req.user.uid]
        );

        console.log('Orders found:', orders.length);

        // 2. Pentru fiecare comandă, obține produsele din order_items
        for (let order of orders) {
            // Calculează total în lei
            order.total = order.total_cents ? (order.total_cents / 100).toFixed(2) : '0';

            // Obține produsele comenzii cu JOIN la products pentru nume
            const { rows: items } = await pool.query(
                `SELECT 
                    order_items.qty,
                    order_items.price_cents,
                    order_items.product_id,
                    products.title
                 FROM order_items
                 LEFT JOIN products ON products.id = order_items.product_id
                 WHERE order_items.order_id = $1`,
                [order.id]
            );

            // Calculează prețul pentru fiecare produs
            order.items = items.map(item => ({
                ...item,
                quantity: item.qty, // Mapăm qty la quantity pentru frontend
                price: item.price_cents ? (item.price_cents / 100).toFixed(2) : '0'
                // title vine deja din JOIN
            }));

            console.log(`Order #${order.id} items:`, order.items);
        }

        console.log('Sending orders to frontend:', orders);
        res.json(orders);

    } catch (err) {
        console.error('Eroare la listMyOrders:', err);
        res.status(500).json({ error: "Eroare la preluarea comenzilor" });
    }
};

// --- 3. DETALII COMANDĂ (Rămâne direct pe DB) ---
exports.getMyOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Luăm comanda
        const o = await pool.query(
            `SELECT * FROM orders WHERE id=$1`,
            [id]
        );
        const order = o.rows[0];

        // 2. Verificăm dacă există și dacă aparține userului curent
        if (!order || order.user_id !== req.user.uid) {
            return res.status(404).json({ error: 'Comanda nu a fost găsită' });
        }

        // 3. Luăm produsele din comandă
        const items = await pool.query(
            `SELECT * FROM order_items WHERE order_id=$1`,
            [id]
        );

        // 4. Returnăm totul
        res.json({ ...order, items: items.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Eroare la preluarea detaliilor comenzii" });
    }
};