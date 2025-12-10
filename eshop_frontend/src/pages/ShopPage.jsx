import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// IMPORTURILE TALE (cu ../ pentru a ieși din folderul pages)
import { useCart } from "../CartContext";
import "../ShopPage.css";

export default function ShopPage({ onLogout }) {
    const navigate = useNavigate();
    const { addToCart, cartCount } = useCart();

    const [user, setUser] = useState(null);

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
        const cats = allProducts.map(p => p.category);
        return ["Toate", ...new Set(cats)];
    }, [allProducts]);

    // 1. Fetch User (pentru Header)
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) return;
            try {
                const res = await fetch("http://localhost:3002/api/account/me", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error("Eroare fetch user:", err);
            }
        };
        fetchUser();
    }, []);

    // 2. Fetch & GENERARE MASIVĂ DE PRODUSE
    useEffect(() => {
        const fetchAndGenerateProducts = async () => {
            try {
                setLoading(true);
                // Luăm produsele de bază de la API
                const res = await fetch('https://dummyjson.com/products?limit=0');
                if (!res.ok) throw new Error("Eroare server produse.");
                const data = await res.json();

                if (!data || !data.products) {
                    setAllProducts([]);
                    setDisplayedProducts([]);
                    setLoading(false);
                    return;
                }

                // Filtrăm doar categoriile tech/electro
                const electronics = data.products.filter(p =>
                    ['laptops', 'smartphones', 'tablets', 'mobile-accessories', 'mens-watches'].includes(p.category)
                );

                // Fallback: dacă nu sunt destule electronice, folosim tot ce avem
                const baseProducts = electronics.length > 0 ? electronics : data.products;

                // --- LOGICA DE MULTIPLICARE (SUTE DE PRODUSE) ---
                const TOTAL_TARGET = 1200; // Vrem 1200 produse în total
                const finalProducts = [];

                for (let i = 0; i < TOTAL_TARGET; i++) {
                    // Alegem un produs "template" prin rotație
                    const template = baseProducts[i % baseProducts.length];

                    // Generăm logică random pentru reduceri (30% șanse)
                    const hasDiscount = Math.random() > 0.7;
                    const discountValue = hasDiscount ? Math.floor(Math.random() * 20) + 5 : 0;

                    // Creăm produsul nou unic
                    finalProducts.push({
                        ...template,
                        id: 10000 + i, // ID unic generat (foarte important pentru React keys)
                        title: `${template.title} (Lot #${i + 1})`,
                        // Variem puțin prețul pentru realism
                        price: Math.max(10, template.price + Math.floor(Math.random() * 50 - 20)),
                        discountPercentage: discountValue,
                        stock: Math.floor(Math.random() * 100) // Stoc random între 0 și 100
                    });
                }

                setAllProducts(finalProducts);
                setDisplayedProducts(finalProducts);
                setLoading(false);
            } catch (err) {
                console.error("Eroare produse:", err);
                setError("Nu s-au putut genera produsele.");
                setLoading(false);
            }
        };
        fetchAndGenerateProducts();
    }, []);

    // 3. Logica de Filtrare (se aplică pe lista mare)
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

        result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        if (onlyDiscount) {
            result = result.filter(p => p.discountPercentage > 0);
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
                            <h1 className="shop-logo">e<span>-shop</span></h1>
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
                                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
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
                        <div key={product.id} className="product-card">
                            <div className="image-container">
                                <img loading="lazy" src={product.thumbnail} alt={product.title} />
                                {product.discountPercentage > 0 && (
                                    <span className="discount-badge">-{Math.round(product.discountPercentage)}%</span>
                                )}
                            </div>
                            <div className="product-info">
                                <h3>{product.title}</h3>
                                <div className="price-row">
                                    <span className="price">{Number(product.price).toFixed(2)} Lei</span>
                                    <button className="add-cart-btn" onClick={() => addToCart(product)}>Adaugă</button>
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