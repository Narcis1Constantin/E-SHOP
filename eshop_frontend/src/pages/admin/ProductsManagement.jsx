import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../UserContext';
import './ProductsManagement.css';

export default function ProductsManagement() {
    const { user, logout } = useUser();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        price_cents: '',
        stock: '',
        brand: '',
        category: '',
        image_url: '',
        description: '',
        discount_percentage: 0,
        is_refurbished: false // ← NOU
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('https://smartdepot.onrender.com/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Eroare la încărcarea produselor:', error);
            alert('Eroare la încărcarea produselor');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            title: '',
            price_cents: '',
            stock: '',
            brand: '',
            category: '',
            image_url: '',
            description: '',
            discount_percentage: 0,
            is_refurbished: false // ← NOU
        });
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        const priceCents = Math.round(product.price * 100);
        setFormData({
            title: product.title,
            price_cents: priceCents,
            stock: product.stock,
            brand: product.brand || '',
            category: product.category || '',
            image_url: product.imageUrl || '',
            description: product.description || '',
            discount_percentage: product.discountPercentage || 0,
            is_refurbished: product.isRefurbished || false // ← NOU
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        try {
            const url = editingProduct
                ? `https://smartdepot.onrender.com/api/admin/products/${editingProduct.id}`
                : 'https://smartdepot.onrender.com/api/admin/products';

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Eroare la salvarea produsului');
            }

            alert(editingProduct ? 'Produs actualizat!' : 'Produs adăugat!');
            setShowModal(false);
            fetchProducts();
        } catch (error) {
            console.error('Eroare:', error);
            alert(error.message);
        }
    };

    const handleDelete = async (productId) => {
        if (!confirm('Sigur vrei să ștergi acest produs?')) return;

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`https://smartdepot.onrender.com/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Eroare la ștergerea produsului');
            }

            alert('Produs șters!');
            fetchProducts();
        } catch (error) {
            console.error('Eroare:', error);
            alert(error.message);
        }
    };

    const formatPrice = (priceInLei) => {
        return priceInLei.toFixed(2) + ' RON';
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Gestionare Produse</h1>
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
                            <Link to="/admin/products" className="active">
                                📦 Produse
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/reviews">
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
                    <div className="products-header">
                        <h2>Lista Produse</h2>
                        <button onClick={openAddModal} className="btn-primary">
                            ➕ Adaugă Produs Nou
                        </button>
                    </div>

                    {loading ? (
                        <p>Se încarcă produsele...</p>
                    ) : (
                        <div className="products-table-container">
                            <table className="products-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Imagine</th>
                                    <th>Titlu</th>
                                    <th>Preț</th>
                                    <th>Reducere</th>
                                    <th>Resigilat</th> {/* ← NOU */}
                                    <th>Stoc</th>
                                    <th>Brand</th>
                                    <th>Categorie</th>
                                    <th>Acțiuni</th>
                                </tr>
                                </thead>
                                <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    className="product-thumb"
                                                />
                                            ) : (
                                                <div className="no-image">📦</div>
                                            )}
                                        </td>
                                        <td>{product.title}</td>
                                        <td>{formatPrice(product.price)}</td>
                                        <td>
                                            {product.discountPercentage > 0 ? (
                                                <span className="discount-badge-admin">
                                                    -{product.discountPercentage}%
                                                </span>
                                            ) : (
                                                <span style={{ color: '#999' }}>-</span>
                                            )}
                                        </td>
                                        {/* ← NOU: Afișare status resigilat */}
                                        <td>
                                            {product.isRefurbished ? (
                                                <span className="refurbished-badge-admin">
                                                    ♻️ DA
                                                </span>
                                            ) : (
                                                <span style={{ color: '#999' }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={product.stock > 0 ? 'stock-available' : 'stock-unavailable'}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td>{product.brand || '-'}</td>
                                        <td>{product.category || '-'}</td>
                                        <td className="actions-cell">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="btn-edit"
                                                title="Editează"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="btn-delete"
                                                title="Șterge"
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

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>{editingProduct ? 'Editează Produs' : 'Adaugă Produs Nou'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Titlu *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Preț (cenți) *</label>
                                    <input
                                        type="number"
                                        name="price_cents"
                                        value={formData.price_cents}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                    />
                                    <small>Ex: 50000 = 500 RON</small>
                                </div>

                                <div className="form-group">
                                    <label>Stoc</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Reducere (%) 🔥</label>
                                <input
                                    type="number"
                                    name="discount_percentage"
                                    value={formData.discount_percentage}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    placeholder="Ex: 20 pentru 20% reducere"
                                />
                                <small>Introdu 0 pentru produs fără reducere</small>
                            </div>

                            {/* ← NOU: Checkbox pentru produs resigilat */}
                            <div className="form-group">
                                <label className="checkbox-label-custom">
                                    <input
                                        type="checkbox"
                                        name="is_refurbished"
                                        checked={formData.is_refurbished}
                                        onChange={handleInputChange}
                                    />
                                    <span>♻️ Produs Resigilat</span>
                                </label>
                                <small>Bifează dacă produsul este resigilat/reconditionat</small>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Categorie</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>URL Imagine</label>
                                <input
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Descriere</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="5"
                                    placeholder="Descrierea produsului..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Anulează
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingProduct ? 'Salvează' : 'Adaugă'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}