import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { useCart } from '../CartContext';
import './ProductDetailsPage.css';

export default function ProductDetailsPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useUser();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProductDetails();
        fetchReviews();
    }, [productId]);

    const fetchProductDetails = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`https://smartdepot.onrender.com/api/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const products = await res.json();
            const foundProduct = products.find(p => p.id === parseInt(productId));
            setProduct(foundProduct);
            setLoading(false);
        } catch (error) {
            console.error('Eroare la încărcarea produsului:', error);
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`https://smartdepot.onrender.com/api/products/${productId}/reviews`);
            const data = await res.json();
            setReviews(data);
        } catch (error) {
            console.error('Eroare la încărcarea recenziilor:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        if (!token) {
            setMessage('Trebuie să fii autentificat pentru a lăsa o recenzie');
            return;
        }

        try {
            const res = await fetch(`https://smartdepot.onrender.com/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewForm)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Eroare la adăugarea recenziei');
            }

            setMessage('Recenzie adăugată cu succes!');
            setReviewForm({ rating: 5, comment: '' });
            fetchReviews();

            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.message);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Sigur vrei să ștergi această recenzie?')) return;

        const token = localStorage.getItem('authToken');

        try {
            const res = await fetch(`https://smartdepot.onrender.com/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Eroare la ștergerea recenziei');
            }

            alert('Recenzie ștearsă!');
            fetchReviews();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleAddToCart = () => {
        addToCart(product);
        alert('Produs adăugat în coș!');
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const renderStars = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (loading) {
        return <div className="loading">Se încarcă...</div>;
    }

    if (!product) {
        return <div className="error">Produs negăsit</div>;
    }

    return (
        <div className="product-details-page">
            {/* Header */}
            <header className="details-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Înapoi
                </button>
                <h1>SmartDepot</h1>
            </header>

            {/* Product Info */}
            <div className="product-container">
                <div className="product-image-section">
                    <img
                        src={product.imageUrl || 'https://placehold.co/500x500?text=Fara+imagine'}
                        alt={product.title}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/500x500?text=Fara+imagine';
                        }}
                    />
                </div>

                <div className="product-info-section">
                    <h1>{product.title}</h1>

                    <div className="rating-summary">
                        <span className="stars">{renderStars(Math.round(calculateAverageRating()))}</span>
                        <span className="rating-text">
                            {calculateAverageRating()} ({reviews.length} recenzii)
                        </span>
                    </div>

                    <div className="price-section">
                        <span className="price">{product.price.toFixed(2)} Lei</span>
                        {product.stock > 0 ? (
                            <span className="stock in-stock">✓ În stoc ({product.stock} buc)</span>
                        ) : (
                            <span className="stock out-of-stock">✗ Stoc epuizat</span>
                        )}
                    </div>

                    <div className="product-meta">
                        {product.brand && <p><strong>Brand:</strong> {product.brand}</p>}
                        {product.category && <p><strong>Categorie:</strong> {product.category}</p>}
                    </div>

                    <div className="product-actions">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="add-to-cart-btn"
                        >
                            {product.stock > 0 ? '🛒 Adaugă în coș' : 'Indisponibil'}
                        </button>
                    </div>

                    {/* Description */}
                    <div className="product-description">
                        <h2>Descriere</h2>
                        <p>{product.description || 'Nicio descriere disponibilă momentan.'}</p>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section">
                <h2>Recenzii clienți ({reviews.length})</h2>

                {/* Review Form */}
                {user && (
                    <div className="review-form">
                        <h3>Lasă o recenzie</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className="form-group">
                                <label>Rating:</label>
                                <select
                                    value={reviewForm.rating}
                                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                                    <option value={4}>⭐⭐⭐⭐☆ (4)</option>
                                    <option value={3}>⭐⭐⭐☆☆ (3)</option>
                                    <option value={2}>⭐⭐☆☆☆ (2)</option>
                                    <option value={1}>⭐☆☆☆☆ (1)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Comentariu:</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    placeholder="Scrie recenzia ta aici... (minim 10 caractere)"
                                    rows="4"
                                    required
                                    minLength={10}
                                />
                            </div>

                            <button type="submit" className="submit-review-btn">
                                Publică recenzia
                            </button>
                        </form>

                        {message && (
                            <div className={`message ${message.includes('succes') ? 'success' : 'error'}`}>
                                {message}
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                    {reviews.length === 0 ? (
                        <p className="no-reviews">Nicio recenzie încă. Fii primul care lasă o recenzie!</p>
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <div>
                                        <strong>{review.user_name}</strong>
                                        <span className="review-stars">{renderStars(review.rating)}</span>
                                    </div>
                                    <div className="review-meta">
                                        <span className="review-date">
                                            {new Date(review.created_at).toLocaleDateString('ro-RO')}
                                        </span>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="delete-review-btn"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}