import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../UserContext';
import './AdminDashboard.css';

export default function ReviewsManagement() {
    const { user, logout } = useUser();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3002/api/products');
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error('Eroare la încărcarea produselor:', error);
            setLoading(false);
        }
    };

    const fetchReviews = async (productId) => {
        try {
            const res = await fetch(`http://localhost:3002/api/products/${productId}/reviews`);
            const data = await res.json();
            setReviews(data);
        } catch (error) {
            console.error('Eroare la încărcarea recenziilor:', error);
        }
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        fetchReviews(product.id);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Sigur vrei să ștergi această recenzie?')) return;

        const token = localStorage.getItem('authToken');

        try {
            const res = await fetch(`http://localhost:3002/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Eroare la ștergerea recenziei');
            }

            alert('Recenzie ștearsă!');
            fetchReviews(selectedProduct.id);
        } catch (error) {
            alert(error.message);
        }
    };

    const renderStars = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Gestionare Recenzii</h1>
                    <div className="admin-user-info">
                        <span>👤 {user?.name}</span>
                        <button onClick={logout} className="btn-logout">
                            Ieșire
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-content">
                <nav className="admin-sidebar">
                    <ul>
                        <li>
                            <Link to="/admin">
                                📊 Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/products">
                                📦 Produse
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/reviews" className="active">
                                ⭐ Recenzii
                            </Link>
                        </li>
                        <li><Link to="/admin/financing">💳 Finanțări</Link></li>
                        <li><Link to="/admin/users">👥 Utilizatori</Link></li>
                        <li><Link to="/admin/orders">🛒 Comenzi</Link></li>
                        <li><Link to="/admin/returns">🔄 Retururi</Link></li>
                        <li>
                            <Link to="/">
                                🏠 Înapoi la magazin
                            </Link>
                        </li>
                    </ul>
                </nav>

                <main className="admin-main">
                    <h2>Selectează un produs</h2>

                    {loading ? (
                        <p>Se încarcă produsele...</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {products.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => handleProductSelect(product)}
                                    style={{
                                        border: selectedProduct?.id === product.id ? '2px solid #3498db' : '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        background: selectedProduct?.id === product.id ? '#e3f2fd' : 'white'
                                    }}
                                >
                                    <img
                                        src={product.imageUrl || 'https://via.placeholder.com/100'}
                                        alt={product.title}
                                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{product.title}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedProduct && (
                        <>
                            <h2>Recenzii pentru: {selectedProduct.title}</h2>

                            {reviews.length === 0 ? (
                                <p style={{ color: '#666', fontStyle: 'italic' }}>Nicio recenzie pentru acest produs.</p>
                            ) : (
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
                                    {reviews.map(review => (
                                        <div
                                            key={review.id}
                                            style={{
                                                borderBottom: '1px solid #eee',
                                                padding: '1rem 0',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <strong>{review.user_name}</strong>
                                                    <span style={{ marginLeft: '1rem', fontSize: '1.2rem' }}>
                                                        {renderStars(review.rating)}
                                                    </span>
                                                    <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
                                                        {new Date(review.created_at).toLocaleDateString('ro-RO')}
                                                    </span>
                                                </div>
                                                <p style={{ color: '#333', margin: 0 }}>{review.comment}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                style={{
                                                    background: '#e74c3c',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginLeft: '1rem'
                                                }}
                                            >
                                                🗑️ Șterge
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}