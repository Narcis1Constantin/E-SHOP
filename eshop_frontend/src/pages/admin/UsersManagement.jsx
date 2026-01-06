import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../UserContext';
import './UsersManagement.css';

export default function UsersManagement() {
    const { user, logout } = useUser();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:3002/api/admin/users/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Eroare la încărcarea utilizatorilor');

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la încărcarea utilizatorilor');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (userId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3002/api/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Eroare la încărcarea detaliilor');

            const data = await response.json();
            setUserDetails(data);
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la încărcarea detaliilor utilizatorului');
        }
    };

    const handleChangeRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        if (!confirm(`Sigur vrei să schimbi rolul în "${newRole}"?`)) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3002/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) throw new Error('Eroare la actualizare');

            alert('Rol actualizat cu succes!');
            fetchUsers();
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la actualizarea rolului');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`Sigur vrei să ștergi utilizatorul "${userName}"?\n\nAceastă acțiune este PERMANENTĂ!`)) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3002/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Eroare la ștergere');

            alert('Utilizator șters!');
            fetchUsers();
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la ștergerea utilizatorului');
        }
    };

    const getRoleBadge = (role) => {
        return role === 'admin'
            ? <span className="role-badge admin">👑 Admin</span>
            : <span className="role-badge user">👤 User</span>;
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Gestionare Utilizatori</h1>
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
                        <li><Link to="/admin/users" className="active">👥 Utilizatori</Link></li>
                        <li><Link to="/admin/orders">🛒 Comenzi</Link></li>
                        <li><Link to="/admin/returns">🔄 Retururi</Link></li>
                        <li><Link to="/">🏠 Înapoi la magazin</Link></li>
                    </ul>
                </nav>

                <main className="admin-main">
                    <div className="users-header">
                        <h2>Utilizatori înregistrați ({users.length})</h2>
                    </div>

                    {loading ? (
                        <p>Se încarcă utilizatorii...</p>
                    ) : (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nume</th>
                                    <th>Email</th>
                                    <th>Telefon</th>
                                    <th>Rol</th>
                                    <th>Comenzi</th>
                                    <th>Recenzii</th>
                                    <th>Finanțări</th>
                                    <th>Înregistrat</th>
                                    <th>Acțiuni</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td><strong>{u.name}</strong></td>
                                        <td>{u.email}</td>
                                        <td>{u.phone || '-'}</td>
                                        <td>{getRoleBadge(u.role)}</td>
                                        <td className="center-text">{u.total_orders || 0}</td>
                                        <td className="center-text">{u.total_reviews || 0}</td>
                                        <td className="center-text">{u.total_financing_applications || 0}</td>
                                        <td>{new Date(u.created_at).toLocaleDateString('ro-RO')}</td>
                                        <td className="actions-cell">
                                            <button
                                                onClick={() => handleViewDetails(u.id)}
                                                className="btn-view"
                                                title="Vezi detalii"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                onClick={() => handleChangeRole(u.id, u.role)}
                                                className="btn-role"
                                                title="Schimbă rol"
                                            >
                                                🔄
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                className="btn-delete"
                                                title="Șterge"
                                                disabled={u.id === user?.id}
                                            >
                                                🗑️
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

            {/* Modal detalii utilizator */}
            {showDetailsModal && userDetails && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content-users" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-users">
                            <h3>Detalii utilizator: {userDetails.user.name}</h3>
                            <button className="close-modal-btn" onClick={() => setShowDetailsModal(false)}>✕</button>
                        </div>

                        <div className="modal-body-users">
                            <div className="detail-section">
                                <h4>📋 Informații personale</h4>
                                <div className="detail-grid">
                                    <div><strong>Email:</strong> {userDetails.user.email}</div>
                                    <div><strong>Telefon:</strong> {userDetails.user.phone || '-'}</div>
                                    <div><strong>Adresă:</strong> {userDetails.user.address || '-'}</div>
                                    <div><strong>Rol:</strong> {getRoleBadge(userDetails.user.role)}</div>
                                    <div><strong>Înregistrat:</strong> {new Date(userDetails.user.created_at).toLocaleDateString('ro-RO')}</div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>🛒 Comenzi ({userDetails.orders.length})</h4>
                                {userDetails.orders.length > 0 ? (
                                    <table className="mini-table">
                                        <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Data</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {userDetails.orders.map(order => (
                                            <tr key={order.id}>
                                                <td>#{order.id}</td>
                                                <td>{(order.total_cents / 100).toFixed(2)} Lei</td>
                                                <td><span className={`status-badge-small ${order.status}`}>{order.status}</span></td>
                                                <td>{new Date(order.created_at).toLocaleDateString('ro-RO')}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="no-data">Nu există comenzi</p>
                                )}
                            </div>

                            <div className="detail-section">
                                <h4>⭐ Recenzii ({userDetails.reviews.length})</h4>
                                {userDetails.reviews.length > 0 ? (
                                    <div className="reviews-list">
                                        {userDetails.reviews.map(review => (
                                            <div key={review.id} className="review-item">
                                                <div className="review-header">
                                                    <span className="rating">{'⭐'.repeat(review.rating)}</span>
                                                    <span className="product-title">{review.product_title}</span>
                                                </div>
                                                <p>{review.comment}</p>
                                                <small>{new Date(review.created_at).toLocaleDateString('ro-RO')}</small>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data">Nu există recenzii</p>
                                )}
                            </div>

                            <div className="detail-section">
                                <h4>💳 Cereri finanțare ({userDetails.financing.length})</h4>
                                {userDetails.financing.length > 0 ? (
                                    <table className="mini-table">
                                        <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Sumă</th>
                                            <th>Luni</th>
                                            <th>Status</th>
                                            <th>Data</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {userDetails.financing.map(fin => (
                                            <tr key={fin.id}>
                                                <td>#{fin.id}</td>
                                                <td>{parseFloat(fin.amount).toFixed(2)} Lei</td>
                                                <td>{fin.months}</td>
                                                <td><span className={`status-badge-small ${fin.status}`}>{fin.status}</span></td>
                                                <td>{new Date(fin.created_at).toLocaleDateString('ro-RO')}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="no-data">Nu există cereri de finanțare</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}