import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../UserContext';
import './UsersManagement.css'; // Refolosim stilurile de Users

export default function ReturnsManagement() {
    const { user, logout } = useUser();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://smartdepot.onrender.com/api/returns/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Eroare la încărcarea retururilor');

            const data = await response.json();
            setReturns(data);
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la încărcarea retururilor');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (returnId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`https://smartdepot.onrender.com/api/returns/admin/${returnId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Eroare la încărcarea detaliilor');

            const data = await response.json();
            setSelectedReturn(data);
            setAdminNotes(data.admin_notes || '');
            setShowModal(true);
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la încărcarea detaliilor returului');
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedReturn) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`https://smartdepot.onrender.com/api/returns/admin/${selectedReturn.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminNotes })
            });

            if (!response.ok) throw new Error('Eroare la actualizare');

            alert('Status actualizat cu succes! Client-ul va primi email de notificare.');
            setShowModal(false);
            fetchReturns();
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la actualizarea statusului');
        }
    };

    const handleDelete = async (returnId) => {
        if (!confirm('Sigur vrei să ștergi această cerere de retur?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`https://smartdepot.onrender.com/api/returns/admin/${returnId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Eroare la ștergere');

            alert('Cerere ștearsă!');
            fetchReturns();
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la ștergerea cererii');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { text: 'În așteptare', class: 'status-pending' },
            approved: { text: 'Aprobat', class: 'status-approved' },
            rejected: { text: 'Respins', class: 'status-rejected' },
            completed: { text: 'Finalizat', class: 'status-completed' }
        };
        return badges[status] || badges.pending;
    };

    const getReasonLabel = (reason) => {
        const reasons = {
            'defect': 'Produs defect',
            'mismatch': 'Nu corespunde descrierii',
            'changed_mind': 'A schimbat decizia',
            'other': 'Altul'
        };
        return reasons[reason] || reason;
    };

    const filteredReturns = filter === 'all'
        ? returns
        : returns.filter(r => r.status === filter);

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Gestionare Retururi</h1>
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
                        <li><Link to="/admin/orders">🛒 Comenzi</Link></li>
                        <li><Link to="/admin/returns" className="active">🔄 Retururi</Link></li>
                        <li><Link to="/">🏠 Înapoi la magazin</Link></li>
                    </ul>
                </nav>

                <main className="admin-main">
                    <div className="financing-header">
                        <h2>Cereri de retur ({filteredReturns.length})</h2>
                        <div className="filter-buttons">
                            <button
                                className={filter === 'all' ? 'active' : ''}
                                onClick={() => setFilter('all')}
                            >
                                Toate
                            </button>
                            <button
                                className={filter === 'pending' ? 'active' : ''}
                                onClick={() => setFilter('pending')}
                            >
                                În așteptare
                            </button>
                            <button
                                className={filter === 'approved' ? 'active' : ''}
                                onClick={() => setFilter('approved')}
                            >
                                Aprobate
                            </button>
                            <button
                                className={filter === 'rejected' ? 'active' : ''}
                                onClick={() => setFilter('rejected')}
                            >
                                Respinse
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <p>Se încarcă retururile...</p>
                    ) : (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Comandă</th>
                                    <th>Client</th>
                                    <th>Motiv</th>
                                    <th>Total comandă</th>
                                    <th>Status</th>
                                    <th>Data cererii</th>
                                    <th>Acțiuni</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredReturns.map(ret => {
                                    const badge = getStatusBadge(ret.status);
                                    return (
                                        <tr key={ret.id}>
                                            <td>{ret.id}</td>
                                            <td><strong>#{ret.order_id}</strong></td>
                                            <td>
                                                <div className="client-info">
                                                    <strong>{ret.user_name}</strong>
                                                    <small>{ret.user_email}</small>
                                                </div>
                                            </td>
                                            <td>{getReasonLabel(ret.reason)}</td>
                                            <td>{(ret.total_cents / 100).toFixed(2)} Lei</td>
                                            <td>
                                                    <span className={`status-badge ${badge.class}`}>
                                                        {badge.text}
                                                    </span>
                                            </td>
                                            <td>{new Date(ret.created_at).toLocaleDateString('ro-RO')}</td>
                                            <td className="actions-cell">
                                                <button
                                                    onClick={() => handleViewDetails(ret.id)}
                                                    className="btn-view"
                                                    title="Vezi detalii"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ret.id)}
                                                    className="btn-delete"
                                                    title="Șterge"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* MODAL DETALII RETUR */}
            {showModal && selectedReturn && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content-users" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-users">
                            <h3>Detalii retur #{selectedReturn.id}</h3>
                            <button className="close-modal-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="modal-body-users">
                            <div className="detail-section">
                                <h4>📋 Informații cerere</h4>
                                <div className="detail-grid">
                                    <div><strong>Comandă:</strong> #{selectedReturn.order_id}</div>
                                    <div><strong>Client:</strong> {selectedReturn.user_name}</div>
                                    <div><strong>Email:</strong> {selectedReturn.user_email}</div>
                                    <div><strong>Telefon:</strong> {selectedReturn.user_phone || '-'}</div>
                                    <div><strong>Motiv:</strong> {getReasonLabel(selectedReturn.reason)}</div>
                                    <div><strong>Data cererii:</strong> {new Date(selectedReturn.created_at).toLocaleDateString('ro-RO')}</div>
                                </div>
                                {selectedReturn.details && (
                                    <div style={{ marginTop: '15px' }}>
                                        <strong>Detalii suplimentare:</strong>
                                        <p style={{ marginTop: '5px', color: '#666' }}>{selectedReturn.details}</p>
                                    </div>
                                )}
                            </div>

                            <div className="detail-section">
                                <h4>📦 Produse din comandă</h4>
                                {selectedReturn.items && selectedReturn.items.length > 0 ? (
                                    <table className="mini-table">
                                        <thead>
                                        <tr>
                                            <th>Produs</th>
                                            <th>Cantitate</th>
                                            <th>Preț</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {selectedReturn.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.title || '-'}</td>
                                                <td className="center-text">{item.quantity}</td>
                                                <td>{Number(item.price || 0).toFixed(2)} Lei</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="no-data">Nu există produse</p>
                                )}
                                <div style={{ marginTop: '15px', textAlign: 'right' }}>
                                    <strong>Total comandă: {(selectedReturn.total_cents / 100).toFixed(2)} Lei</strong>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>✏️ Gestionare retur</h4>
                                <div className="form-group">
                                    <label>Notițe admin</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows="4"
                                        placeholder="Adaugă notițe pentru client..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #ddd',
                                            borderRadius: '8px',
                                            fontFamily: 'Roboto, sans-serif',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <div className="status-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                                    <button
                                        className="status-btn pending"
                                        onClick={() => handleUpdateStatus('pending')}
                                        style={{
                                            background: '#fff3cd',
                                            color: '#856404',
                                            border: 'none',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '14px'
                                        }}
                                    >
                                        În așteptare
                                    </button>
                                    <button
                                        className="status-btn approved"
                                        onClick={() => handleUpdateStatus('approved')}
                                        style={{
                                            background: '#d4edda',
                                            color: '#155724',
                                            border: 'none',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '14px'
                                        }}
                                    >
                                        ✅ Aprobă
                                    </button>
                                    <button
                                        className="status-btn rejected"
                                        onClick={() => handleUpdateStatus('rejected')}
                                        style={{
                                            background: '#f8d7da',
                                            color: '#721c24',
                                            border: 'none',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '14px'
                                        }}
                                    >
                                        ❌ Respinge
                                    </button>
                                    <button
                                        className="status-btn completed"
                                        onClick={() => handleUpdateStatus('completed')}
                                        style={{
                                            background: '#d1ecf1',
                                            color: '#0c5460',
                                            border: 'none',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '14px'
                                        }}
                                    >
                                        ✔️ Finalizează
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}