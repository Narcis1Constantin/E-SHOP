import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../UserContext";

// 🔥 TRUC: ca să fie 1:1 ca Users, importă CSS-ul de Users
import "./UsersManagement.css";   // ✅ dacă fișierul e în același folder admin
import "./OrdersManagement.css";  // doar pentru mici ajustări (opțional)

export default function OrdersManagement() {
    const { user, logout } = useUser();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // modal
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch("http://localhost:3002/api/admin/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Eroare la încărcarea comenzilor");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
            alert("Eroare la încărcarea comenzilor");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(
                `http://localhost:3002/api/admin/orders/${orderId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || "Eroare la actualizare status");

            await fetchOrders();

            // dacă modalul e deschis pe comanda asta, reîncarcăm detaliile
            if (showOrderModal && orderDetails?.id === orderId) {
                await handleViewOrder(orderId, { silent: true });
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Eroare la actualizarea statusului");
        }
    };

    const handleViewOrder = async (orderId, opts = { silent: false }) => {
        try {
            setDetailsLoading(true);
            const token = localStorage.getItem("authToken");

            const res = await fetch(
                `http://localhost:3002/api/admin/orders/${orderId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || "Eroare la detalii comandă");

            setOrderDetails(body);
            setShowOrderModal(true);
        } catch (err) {
            console.error(err);
            if (!opts?.silent) alert(err.message || "Eroare la încărcarea detaliilor comenzii");
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setShowOrderModal(false);
        setOrderDetails(null);
    };

    const formatMoney = (cents) => `${(Number(cents || 0) / 100).toFixed(2)} Lei`;

    const statusBadge = (status) => {
        const s = String(status || "").toLowerCase();
        return <span className={`status-badge-small ${s}`}>{status}</span>;
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Gestionare Comenzi</h1>
                    <div className="admin-user-info">
                        <span>👤 {user?.name}</span>
                        <button onClick={logout} className="btn-logout">Ieșire</button>
                    </div>
                </div>
            </header>

            <div className="admin-content">
                <nav className="admin-sidebar">
                    <ul>
                        <li><Link to="/admin">📊 Dashboard</Link></li>
                        <li><Link to="/admin/products">📦 Produse</Link></li>
                        <li><Link to="/admin/reviews">⭐ Recenzii</Link></li>
                        <li><Link to="/admin/financing">💳 Finanțări</Link></li>
                        <li><Link to="/admin/users">👥 Utilizatori</Link></li>
                        <li><Link to="/admin/orders" className="active">🛒 Comenzi</Link></li>
                        <li><Link to="/admin/returns">🔄 Retururi</Link></li>
                        <li><Link to="/">🏠 Înapoi la magazin</Link></li>
                    </ul>
                </nav>

                <main className="admin-main">
                    <div className="users-header">
                        <h2>Comenzi ({orders.length})</h2>
                    </div>

                    {loading ? (
                        <p>Se încarcă comenzile...</p>
                    ) : (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Data</th>
                                    <th>Acțiuni</th>
                                </tr>
                                </thead>

                                <tbody>
                                {orders.map((o) => (
                                    <tr key={o.id}>
                                        <td>#{o.id}</td>
                                        <td>{o.email}</td>
                                        <td>{formatMoney(o.total_cents)}</td>
                                        <td>{statusBadge(o.status)}</td>
                                        <td>{new Date(o.created_at).toLocaleDateString("ro-RO")}</td>

                                        <td className="actions-cell">
                                            <button
                                                onClick={() => handleViewOrder(o.id)}
                                                className="btn-view"
                                                title="Vezi detalii"
                                            >
                                                👁️
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* MODAL – folosește aceleași clase ca Users */}
            {showOrderModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content-users" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-users">
                            <h3>
                                {orderDetails ? `Detalii comandă #${orderDetails.id}` : "Detalii comandă"}
                            </h3>
                            <button className="close-modal-btn" onClick={closeModal}>✕</button>
                        </div>

                        <div className="modal-body-users">
                            {detailsLoading || !orderDetails ? (
                                <p className="no-data">Se încarcă detaliile...</p>
                            ) : (
                                <>
                                    <div className="detail-section">
                                        <h4>🧾 Informații comandă</h4>
                                        <div className="detail-grid">
                                            <div><strong>Email:</strong> {orderDetails.email || "-"}</div>
                                            <div><strong>Status:</strong> {statusBadge(orderDetails.status)}</div>
                                            <div><strong>Total:</strong> {formatMoney(orderDetails.total_cents)}</div>
                                            <div><strong>Data:</strong> {new Date(orderDetails.created_at).toLocaleDateString("ro-RO")}</div>
                                            <div style={{ gridColumn: "1 / -1" }}>
                                                <strong>Adresă:</strong> {orderDetails.address || "-"}
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 12 }}>
                                            <strong>Schimbă status:</strong>{" "}
                                            <select
                                                className="orders-status-select"
                                                value={orderDetails.status}
                                                onChange={(e) => updateStatus(orderDetails.id, e.target.value)}
                                            >
                                                <option value="placed">placed</option>
                                                <option value="paid">paid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>📦 Produse</h4>

                                        {Array.isArray(orderDetails.items) && orderDetails.items.length > 0 ? (
                                            <table className="mini-table">
                                                <thead>
                                                <tr>
                                                    <th>Produs</th>
                                                    <th>Cantitate</th>
                                                    <th>Preț</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {orderDetails.items.map((it, idx) => (
                                                    <tr key={idx}>
                                                        <td>{it.title || "-"}</td>
                                                        <td className="center-text">{it.quantity}</td>
                                                        <td>{Number(it.price || 0).toFixed(2)} Lei</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="no-data">Nu există produse</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
