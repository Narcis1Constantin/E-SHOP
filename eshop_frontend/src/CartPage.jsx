import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useShopFacade } from "../hooks/useShopFacade";
import "../CartPage.css";

const customMarkerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

export default function CartPage() {
    const navigate = useNavigate();

    // Folosim Facade Pattern
    const {
        cartItems,
        cartTotal,
        removeFromCart,
        updateQuantity,
        processCheckout,
        isProcessing
    } = useShopFacade();

    const [userData, setUserData] = useState({
        nume: "",
        email: "",
        telefon: "",
        judet: "",
        oras: "",
        adresa: ""
    });

    const [deliveryMethod, setDeliveryMethod] = useState("home");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [mapCenter, setMapCenter] = useState([44.4268, 26.1025]);
    const [lockers, setLockers] = useState([]);

    useEffect(() => {
        // Generăm lockere fictive
        const mocks = Array.from({length: 5}).map((_, i) => ({
            id: i,
            name: `Easybox - Strada Jitia, Nr. ${i + 1}`,
            lat: 44.4268 + (Math.random()-0.5)*0.05,
            lng: 26.1025 + (Math.random()-0.5)*0.05
        }));
        setLockers(mocks);
    }, []);

    const handleCheckout = async () => {
        try {
            await processCheckout(userData, deliveryMethod, selectedLocker, paymentMethod);
        } catch (err) {
            console.error('Checkout failed:', err);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page-wrapper empty-state">
                <h2>Coșul tău este gol</h2>
                <p>Adaugă produse pentru a continua</p>
                <button onClick={() => navigate("/shop")} className="back-btn">
                    Înapoi la magazin
                </button>
            </div>
        );
    }

    return (
        <div className="cart-page-wrapper">
            <div className="cart-header">
                <h1>Finalizare Comandă</h1>
                <button onClick={() => navigate("/shop")} className="back-btn-small">
                    ← Înapoi la magazin
                </button>
            </div>

            <div className="cart-layout">
                {/* === PRODUSE === */}
                <div className="cart-section">
                    <h2>Produse</h2>
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item-card">
                                <img
                                    src={item.imageUrl || item.thumbnail}
                                    alt={item.title}
                                    className="cart-item-image"
                                />
                                <div className="cart-item-info">
                                    <h3>{item.title}</h3>
                                    <p className="cart-item-price">{item.price} Lei</p>
                                </div>
                                <div className="cart-item-quantity">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                    <span>x{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* === LIVRARE === */}
                <div className="cart-section">
                    <h2>Livrare</h2>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            placeholder="email@exemplu.com"
                            value={userData.email}
                            onChange={e => setUserData({...userData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div className="delivery-tabs">
                        <button
                            onClick={() => setDeliveryMethod("home")}
                            className={deliveryMethod === "home" ? "active" : ""}
                        >
                            🚚 Curier
                        </button>
                        <button
                            onClick={() => setDeliveryMethod("easybox")}
                            className={deliveryMethod === "easybox" ? "active" : ""}
                        >
                            📦 Easybox
                        </button>
                    </div>

                    {deliveryMethod === "home" ? (
                        <div className="delivery-home-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nume *</label>
                                    <input
                                        type="text"
                                        placeholder="Nume complet"
                                        value={userData.nume}
                                        onChange={e => setUserData({...userData, nume: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telefon *</label>
                                    <input
                                        type="tel"
                                        placeholder="07XXXXXXXX"
                                        value={userData.telefon}
                                        onChange={e => setUserData({...userData, telefon: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Oraș</label>
                                    <input
                                        type="text"
                                        placeholder="București"
                                        value={userData.oras}
                                        onChange={e => setUserData({...userData, oras: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Județ</label>
                                    <input
                                        type="text"
                                        placeholder="Ilfov"
                                        value={userData.judet}
                                        onChange={e => setUserData({...userData, judet: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Adresă completă *</label>
                                <textarea
                                    placeholder="Strada, Nr, Bloc, Scara, Apartament..."
                                    value={userData.adresa}
                                    onChange={e => setUserData({...userData, adresa: e.target.value})}
                                    rows="3"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="delivery-easybox">
                            <p className="info-text">Selectează un Easybox de pe hartă:</p>
                            <div className="map-container">
                                <MapContainer center={mapCenter} zoom={13} style={{height:'350px', width:'100%'}}>
                                    <ChangeView center={mapCenter} />
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                    {lockers.map(l => (
                                        <Marker
                                            key={l.id}
                                            position={[l.lat, l.lng]}
                                            icon={customMarkerIcon}
                                            eventHandlers={{
                                                click: () => {
                                                    setSelectedLocker(l);
                                                    setMapCenter([l.lat, l.lng]);
                                                }
                                            }}
                                        />
                                    ))}
                                </MapContainer>
                            </div>
                            {selectedLocker && (
                                <div className="selected-locker">
                                    <strong>✅ Selectat:</strong> {selectedLocker.name}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* === METODĂ DE PLATĂ === */}
                <div className="cart-section">
                    <h2>Metodă de plată</h2>

                    <div className="payment-options">
                        <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="payment-content">
                                <span className="payment-icon">💳</span>
                                <div>
                                    <strong>Card Online</strong>
                                    <p>Plată securizată prin Stripe</p>
                                </div>
                            </div>
                        </label>

                        <label className={`payment-option ${paymentMethod === 'ramburs' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="ramburs"
                                checked={paymentMethod === 'ramburs'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="payment-content">
                                <span className="payment-icon">💵</span>
                                <div>
                                    <strong>Ramburs la livrare</strong>
                                    <p>Plătești când primești comanda</p>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* === SUMAR === */}
                <div className="cart-summary">
                    <h2>Sumar Comandă</h2>
                    <div className="summary-row">
                        <span>Produse ({cartItems.length}):</span>
                        <span>{cartTotal.toFixed(2)} Lei</span>
                    </div>
                    <div className="summary-row">
                        <span>Livrare:</span>
                        <span className="free">Gratuit</span>
                    </div>
                    <div className="summary-total">
                        <span>TOTAL:</span>
                        <span>{cartTotal.toFixed(2)} Lei</span>
                    </div>

                    <button
                        className="checkout-btn"
                        onClick={handleCheckout}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Se procesează..." : (
                            paymentMethod === 'card'
                                ? `Plătește ${cartTotal.toFixed(2)} Lei`
                                : `Trimite Comanda`
                        )}
                    </button>

                    {paymentMethod === 'card' && (
                        <p className="payment-info">
                            🔒 Vei fi redirecționat către Stripe pentru plată securizată
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}