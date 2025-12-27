import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        loading: true
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const token = localStorage.getItem('authToken');

        try {
            // Încărcăm statistici de bază
            const productsRes = await fetch('http://localhost:3002/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const products = await productsRes.json();

            setStats({
                totalProducts: products.length || 0,
                totalOrders: 0, // Poți adăuga endpoint pentru comenzi
                totalUsers: 0, // Poți adăuga endpoint pentru users
                loading: false
            });
        } catch (error) {
            console.error('Eroare la încărcarea statisticilor:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Panou Administrator</h1>
                    <div className="admin-user-info">
                        <span>👤 {user?.name}</span>
                        <button onClick={handleLogout} className="btn-logout">
                            Ieșire
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-content">
                <nav className="admin-sidebar">
                    <ul>
                        <li>
                            <Link to="/admin" className="active">
                                📊 Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/products">
                                📦 Produse
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/reviews">  {/* ← NOU */}
                                ⭐ Recenzii
                            </Link>
                        </li>
                        <li>
                            <Link to="/">
                                🏠 Înapoi la magazin
                            </Link>
                        </li>
                    </ul>
                </nav>

                <main className="admin-main">
                    <h2>Statistici generale</h2>

                    {stats.loading ? (
                        <p>Se încarcă statistici...</p>
                    ) : (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-content">
                                    <h3>{stats.totalProducts}</h3>
                                    <p>Produse totale</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🛒</div>
                                <div className="stat-content">
                                    <h3>{stats.totalOrders}</h3>
                                    <p>Comenzi totale</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-content">
                                    <h3>{stats.totalUsers}</h3>
                                    <p>Utilizatori</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="quick-actions">
                        <h3>Acțiuni rapide</h3>
                        <div className="actions-grid">
                            <Link to="/admin/products" className="action-card">
                                <span>➕</span>
                                <p>Adaugă produs nou</p>
                            </Link>
                            <Link to="/admin/products" className="action-card">
                                <span>✏️</span>
                                <p>Gestionează produse</p>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}