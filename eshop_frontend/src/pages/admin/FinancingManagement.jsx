import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../UserContext';
import './FinancingManagement.css';

export default function FinancingManagement() {
    const { user, logout } = useUser();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://smartdepot.onrender.com/api/financing/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Eroare la încărcarea cererilor');

            const data = await response.json();
            setApplications(data);
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la încărcarea cererilor de finanțare');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`https://smartdepot.onrender.com/api/financing/admin/${appId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, notes })
            });

            if (!response.ok) throw new Error('Eroare la actualizare');

            alert('Status actualizat cu succes!');
            setShowModal(false);
            setNotes('');
            fetchApplications();
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la actualizarea statusului');
        }
    };

    const handleDelete = async (appId) => {
        if (!confirm('Sigur vrei să ștergi această cerere?')) return;

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`https://smartdepot.onrender.com/api/financing/admin/${appId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Eroare la ștergere');

            alert('Cerere ștearsă!');
            fetchApplications();
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la ștergerea cererii');
        }
    };

    const openStatusModal = (app) => {
        setSelectedApp(app);
        setNotes(app.notes || '');
        setShowModal(true);
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

    const filteredApps = filter === 'all'
        ? applications
        : applications.filter(app => app.status === filter);

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Gestionare Finanțări</h1>
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
                        <li><Link to="/admin/financing" className="active">💳 Finanțări</Link></li>
                        <li><Link to="/admin/users">👥 Utilizatori</Link></li>
                        <li><Link to="/admin/orders">🛒 Comenzi</Link></li>
                        <li><Link to="/admin/returns">🔄 Retururi</Link></li>
                        <li><Link to="/">🏠 Înapoi la magazin</Link></li>
                    </ul>
                </nav>

                <main className="admin-main">
                    <div className="financing-header">
                        <h2>Cereri de finanțare ({filteredApps.length})</h2>
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
                        <p>Se încarcă cererile...</p>
                    ) : (
                        <div className="financing-table-container">
                            <table className="financing-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Client</th>
                                    <th>CNP</th>
                                    <th>Sumă</th>
                                    <th>Luni</th>
                                    <th>Rată lunară</th>
                                    <th>Venit lunar</th>
                                    <th>Status</th>
                                    <th>Data</th>
                                    <th>Acțiuni</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredApps.map(app => {
                                    const badge = getStatusBadge(app.status);
                                    return (
                                        <tr key={app.id}>
                                            <td>{app.id}</td>
                                            <td>
                                                <div className="client-info">
                                                    <strong>{app.full_name}</strong>
                                                    <small>{app.email}</small>
                                                    <small>{app.phone}</small>
                                                </div>
                                            </td>
                                            <td>{app.cnp}</td>
                                            <td><strong>{parseFloat(app.amount).toFixed(2)} Lei</strong></td>
                                            <td>{app.months}</td>
                                            <td>{parseFloat(app.monthly_rate).toFixed(2)} Lei</td>
                                            <td>{parseFloat(app.monthly_income).toFixed(2)} Lei</td>
                                            <td>
                                                    <span className={`status-badge ${badge.class}`}>
                                                        {badge.text}
                                                    </span>
                                            </td>
                                            <td>{new Date(app.created_at).toLocaleDateString('ro-RO')}</td>
                                            <td className="actions-cell">
                                                <button
                                                    onClick={() => openStatusModal(app)}
                                                    className="btn-edit"
                                                    title="Modifică status"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(app.id)}
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

            {showModal && selectedApp && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content-financing" onClick={e => e.stopPropagation()}>
                        <h3>Modifică status cerere #{selectedApp.id}</h3>

                        <div className="modal-info">
                            <p><strong>Client:</strong> {selectedApp.full_name}</p>
                            <p><strong>Sumă:</strong> {parseFloat(selectedApp.amount).toFixed(2)} Lei</p>
                            <p><strong>Perioada:</strong> {selectedApp.months} luni</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <div className="status-buttons">
                                <button
                                    className="status-btn pending"
                                    onClick={() => handleStatusChange(selectedApp.id, 'pending')}
                                >
                                    În așteptare
                                </button>
                                <button
                                    className="status-btn approved"
                                    onClick={() => handleStatusChange(selectedApp.id, 'approved')}
                                >
                                    Aprobă
                                </button>
                                <button
                                    className="status-btn rejected"
                                    onClick={() => handleStatusChange(selectedApp.id, 'rejected')}
                                >
                                    Respinge
                                </button>
                                <button
                                    className="status-btn completed"
                                    onClick={() => handleStatusChange(selectedApp.id, 'completed')}
                                >
                                    Finalizează
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Notițe</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="4"
                                placeholder="Adaugă notițe..."
                            />
                        </div>

                        <button onClick={() => setShowModal(false)} className="btn-cancel">
                            Închide
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}