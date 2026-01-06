import React from "react";
import "../ShopPage.css";
import { useUser } from "../../UserContext";

export default function ShopPageView({
                                         navigate,
                                         onLogout,
                                         userName,
                                         userEmail,
                                         searchTerm,
                                         setSearchTerm,
                                         uniqueCategories,
                                         selectedCategory,
                                         setSelectedCategory,
                                         priceRange,
                                         setPriceRange,
                                         onlyDiscount,
                                         setOnlyDiscount,
                                         onlyInStock,
                                         setOnlyInStock,
                                         showFilters,
                                         setShowFilters,
                                         displayedProducts,
                                         loading,
                                         error,
                                         addToCart,
                                         cartCount
                                     }) {
    const { isAdmin } = useUser();

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

                                        {/* Buton Admin Panel - vizibil doar pentru admini */}
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
                                <span className="btn-text">Coșul meu</span>
                                {cartCount > 0 && (
                                    <span className="cart-badge">{cartCount}</span>
                                )}
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
                        <div className="nav-item has-dropdown">
                            Finantare <i className="fas fa-chevron-down"></i>
                        </div>
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
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Preț Minim: {priceRange.min} lei</label>
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={priceRange.min}
                            onChange={(e) =>
                                setPriceRange({ ...priceRange, min: Number(e.target.value) })
                            }
                        />
                        <div className="price-labels">
                            <span>0 lei</span>
                            <span>10000 lei</span>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Preț Maxim: {priceRange.max} lei</label>
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={priceRange.max}
                            onChange={(e) =>
                                setPriceRange({ ...priceRange, max: Number(e.target.value) })
                            }
                        />
                        <div className="price-labels">
                            <span>0 lei</span>
                            <span>10000 lei</span>
                        </div>
                    </div>

                    <div className="filter-group checkbox-group">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={onlyDiscount}
                                onChange={(e) => setOnlyDiscount(e.target.checked)}
                            />
                            Doar produse la reducere
                        </label>

                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={onlyInStock}
                                onChange={(e) => setOnlyInStock(e.target.checked)}
                            />
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

            {/* === MAIN CONTENT === */}
            <main className={`shop-main-content ${showFilters ? 'shifted' : ''}`}>
                <div className="hero-banner">
                    <h2>Rezultate filtrare</h2>
                    <p>Am găsit {displayedProducts.length} produse conform criteriilor tale.</p>
                </div>

                {loading && <div className="loader">Se încarcă catalogul...</div>}
                {error && <div className="error-message">{error}</div>}

                <div className="products-grid">
                    {displayedProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="image-container">
                                <img loading="lazy" src={product.imageUrl} alt={product.title} />
                                {product.discountPercentage > 0 && (
                                    <span className="discount-badge">
                                        -{Math.round(product.discountPercentage)}%
                                    </span>
                                )}
                            </div>

                            <div className="product-info">
                                <h3>{product.title}</h3>

                                <div className="price-row">
                                    <span className="price">
                                        {Number(product.price).toFixed(2)} lei
                                    </span>
                                    <button
                                        className="add-cart-btn"
                                        onClick={() => addToCart(product)}
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