import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useUser } from "../UserContext";
import "../ShopPage.css";

export default function ShopPage({ onLogout }) {
    const navigate = useNavigate();
    const { addToCart, cartCount } = useCart();
    const { user, isAdmin } = useUser();

    // State pentru produse
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- STATE FILTRE & SEARCH ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Toate");
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [onlyDiscount, setOnlyDiscount] = useState(false);
    const [onlyInStock, setOnlyInStock] = useState(false);

    // Calculăm categoriile unice
    const uniqueCategories = useMemo(() => {
        const cats = allProducts.map(p => p.category).filter(c => c);
        return ["Toate", ...new Set(cats)];
    }, [allProducts]);

    // Fetch produse din BAZA TA DE DATE
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');

                // Luăm produsele din backend-ul tău
                const res = await fetch('http://localhost:3002/api/products', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Eroare la încărcarea produselor.");

                const products = await res.json();

                setAllProducts(products);
                setDisplayedProducts(products);
                setLoading(false);
            } catch (err) {
                console.error("Eroare produse:", err);
                setError("Nu s-au putut încărca produsele.");
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Logica de Filtrare
    useEffect(() => {
        if (allProducts.length === 0) return;
        let result = allProducts;

        if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(p => p.title.toLowerCase().includes(term));
        }
        if (selectedCategory !== "Toate") {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Convertim price din lei în comparație corectă
        result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        if (onlyDiscount) {
            result = result.filter(p => p.discountPercentage && p.discountPercentage > 0);
        }
        if (onlyInStock) {
            result = result.filter(p => p.stock > 0);
        }

        setDisplayedProducts(result);
    }, [searchTerm, selectedCategory, priceRange, onlyDiscount, onlyInStock, allProducts]);

    const userName = user?.name || "Client";
    const userEmail = user?.email || "email@exemplu.com";

    return (
        <div className="shop-page-wrapper">

            {/* === HEADER === */}
            <div className="altex-header-container">
                <div className="header-top">
                    <div className="header-content-width">
                        <div className="logo-section">
                            <h1 className="shop-logo">Smart<span>Depot</span></h1>
                        </div>

                        <div className="search-bar-container">
                            <input
                                type="text"
                                placeholder="Cauta produsul dorit..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="search-btn">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>

                        <div className="user-actions">
                            <div className="account-wrapper">
                                <button className="icon-btn">
                                    <i className="far fa-user"></i>
                                    <span className="btn-text">Cont</span>
                                    <i className="fas fa-chevron-down arrow-icon"></i>
                                </button>
                                <div className="account-dropdown">
                                    <div className="account-header-info">
                                        <div className="avatar-circle">{userName.charAt(0)}</div>
                                        <div>
                                            <div className="u-name">{userName}</div>
                                            <div className="u-email">{userEmail}</div>
                                        </div>
                                    </div>
                                    <div className="dropdown-menu">
                                        <div className="menu-item" onClick={() => navigate("/my-account")}>
                                            <i className="fas fa-id-card"></i> Date personale
                                        </div>

                                        {/* BUTON ADMIN - vizibil doar pentru admini */}
                                        {isAdmin && (
                                            <div className="menu-item admin-link" onClick={() => navigate("/admin")}>
                                                <i className="fas fa-cog"></i> Panou Administrator
                                            </div>
                                        )}

                                        <div className="menu-item" onClick={onLogout}>
                                            <i className="fas fa-sign-out-alt"></i> Deconectare
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="icon-btn cart-custom" onClick={() => navigate("/cart")}>
                                <i className="fas fa-shopping-cart"></i>
                                <span className="btn-text">
                                    Coșul meu
                                    {cartCount > 0 && (
                                        <span style={{
                                            marginLeft:'6px',
                                            background:'#cf002f',
                                            color:'white',
                                            borderRadius:'50%',
                                            padding:'2px 6px',
                                            fontSize:'11px',
                                            fontWeight:'bold'
                                        }}>
                                            {cartCount}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="header-bottom">
                    <div className="header-content-width nav-links">
                        <button
                            className={`products-menu-btn ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <i className="fas fa-bars"></i> Produse / Filtre
                        </button>

                        <a href="#" className="nav-item">Promotii</a>
                        <a href="#" className="nav-item">Resigilate</a>
                        <div className="nav-item has-dropdown">Finantare <i className="fas fa-chevron-down"></i></div>
                        <a href="#" className="nav-item">Suport</a>
                    </div>
                </div>
            </div>

            {/* === SIDEBAR FILTRE === */}
            <div className={`filter-sidebar ${showFilters ? 'open' : ''}`}>
                <div className="filter-header">
                    <h3>Filtrează Produse</h3>
                    <button className="close-filter" onClick={() => setShowFilters(false)}>✕</button>
                </div>

                <div className="filter-content">
                    <div className="filter-group">
                        <label>Categorie</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat ? cat.toUpperCase() : 'NECATEGORIZAT'}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Preț Maxim: {priceRange.max} lei</label>
                        <input
                            type="range" min="0" max="5000" step="100"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        />
                        <div className="price-labels">
                            <span>0 lei</span>
                            <span>5000+ lei</span>
                        </div>
                    </div>

                    <div className="filter-group checkbox-group">
                        <label className="checkbox-container">
                            <input type="checkbox" checked={onlyDiscount} onChange={(e) => setOnlyDiscount(e.target.checked)} />
                            Doar produse la reducere
                        </label>
                        <label className="checkbox-container">
                            <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />
                            Doar produse în stoc
                        </label>
                    </div>

                    <button
                        className="reset-filters-btn"
                        onClick={() => {
                            setSelectedCategory("Toate");
                            setPriceRange({ min: 0, max: 10000 });
                            setOnlyDiscount(false);
                            setOnlyInStock(false);
                            setSearchTerm("");
                        }}
                    >
                        Resetează Filtrele
                    </button>
                </div>
            </div>

            {/* === CONTENT GRID === */}
            <main className={`shop-main-content ${showFilters ? 'shifted' : ''}`}>
                <div className="hero-banner">
                    <h2>Cele mai noi oferte</h2>
                    <p>Descoperă gama noastră variată de produse electronice și electrocasnice.</p>
                </div>

                {loading && <div className="loader">Se încarcă catalogul...</div>}
                {error && <div className="error-message">{error}</div>}

                <div className="products-grid">
                    {displayedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="product-card"
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Imaginea duce la pagina de detalii */}
                            <div
                                className="image-container"
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <img
                                    loading="lazy"
                                    src={product.imageUrl || 'https://via.placeholder.com/300x300?text=Fara+imagine'}
                                    alt={product.title}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x300?text=Fara+imagine';
                                    }}
                                />
                                {product.discountPercentage > 0 && (
                                    <span className="discount-badge">-{Math.round(product.discountPercentage)}%</span>
                                )}
                            </div>

                            {/* Info produs - și asta duce la detalii */}
                            <div
                                className="product-info"
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <h3>{product.title}</h3>
                                <div className="price-row">
                                    <span className="price">{Number(product.price).toFixed(2)} Lei</span>
                                    <button
                                        className="add-cart-btn"
                                        onClick={(e) => {
                                            e.stopPropagation(); // IMPORTANT: oprește propagarea
                                            addToCart(product);
                                            alert('Produs adăugat în coș!');
                                        }}
                                        disabled={product.stock === 0}
                                    >
                                        Adaugă
                                    </button>
                                </div>
                                <span className={`stock-status ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                                    {product.stock > 0 ? "In stoc" : "Stoc epuizat"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}