import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CartPage.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import { useShopFacade } from "../hooks/useShopFacade";
import "../CartPage.css";

const customMarkerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
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
    const {
        cartItems,
        cartTotal,
        processCheckout,
        isProcessing,
        updateQuantity,
        removeFromCart
    } = useShopFacade();

    const [userData, setUserData] = useState({
        nume: "",
        email: "",
        telefon: "",
        judet: "",
        oras: "",
        adresa: ""
    });

    const [deliveryMethod, setDeliveryMethod] = useState("home"); // "home" | "easybox"
    const [paymentMethod, setPaymentMethod] = useState("card");   // "card" | "cash"
    const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });

    const [selectedLocker, setSelectedLocker] = useState(null);
    const [mapCenter, setMapCenter] = useState([44.4268, 26.1025]); // Default: București
    const [citySearch, setCitySearch] = useState("");
    const [lockers, setLockers] = useState([]);

    useEffect(() => {
        generateMockLockers(44.4268, 26.1025);
    }, []);

    const generateMockLockers = (lat, lng) => {
        const newLockers = [];
        for (let i = 1; i <= 5; i++) {
            newLockers.push({
                id: Date.now() + i,
                name: `Easybox #${i}`,
                lat: lat + (Math.random() - 0.5) * 0.06,
                lng: lng + (Math.random() - 0.5) * 0.06
            });
        }
        setLockers(newLockers);
    };

    const handleCitySearch = async () => {
        if (!citySearch) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${citySearch}`);
            const data = await res.json();
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                setMapCenter([lat, lon]);
                generateMockLockers(lat, lon);
                setSelectedLocker(null);
            } else {
                alert("Oraș negăsit.");
            }
        } catch (e) { console.error(e); }
    };

    const handleMarkerClick = async (locker) => {
        setSelectedLocker({...locker, name: "Se caută adresa..."});
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${locker.lat}&lon=${locker.lng}`);
            const data = await res.json();
            const addr = data.address;
            const str = addr.road || addr.pedestrian || "Locație";
            const nr = addr.house_number ? `, Nr. ${addr.house_number}` : "";
            setSelectedLocker({...locker, name: `Easybox - ${str}${nr}`});
        } catch(e) {
            setSelectedLocker({...locker, name: "Easybox - Adresă indisponibilă"});
        }
    };

    const handleCheckoutClick = () => {
        processCheckout(userData, deliveryMethod, selectedLocker, paymentMethod);
    };
    if (cartItems.length === 0) {
        return (
            <>
                <div className="cart-header">
                    <div className="cart-header-content">
                        <h1 className="cart-logo">Smart<span>Depot</span></h1>
                        <h2 className="cart-page-title">Finalizare Comandă</h2>
                        <div className="cart-header-spacer"></div>
                    </div>
                </div>
                <div className="cart-page-wrapper empty-state">
                    <div className="empty-cart-box">
                        <div className="empty-icon-circle">
                            <i className="fas fa-shopping-basket"></i>
                        </div>
                        <h2>Coșul tău este gol</h2>
                        <p>Nu ai adăugat încă niciun produs în coșul de cumpărături.</p>
                        <button className="return-shop-btn" onClick={() => navigate("/")}>
                            Înapoi la Magazin
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="cart-header">
                <div className="cart-header-content">
                    <h1 className="cart-logo">Smart<span>Depot</span></h1>
                    <h2 className="cart-page-title">Finalizare Comandă</h2>
                    <div className="cart-header-spacer"></div>
                </div>
            </div>
            <div className="cart-page-wrapper">
                <div className="cart-layout">

                    {/* --- SECȚIUNEA STÂNGĂ (Produse + Formular) --- */}
                    <div className="cart-left-section">

                        {/* LISTA PRODUSE */}
                        <div className="section-box cart-items-box">
                            <h3>Produse</h3>
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-details">
                                        <h4>{item.title}</h4>
                                        <p>{item.price} Lei</p>
                                    </div>
                                    <div className="quantity-controls">
                                        <button onClick={()=>updateQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={()=>updateQuantity(item.id, 1)}>+</button>
                                    </div>
                                    <div className="item-total">
                                        {(item.price * item.quantity).toFixed(2)} Lei
                                    </div>
                                    <button className="remove-btn" onClick={()=>removeFromCart(item.id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* FORMULAR LIVRARE & PLATĂ */}
                        <div className="section-box delivery-box">
                            <h3>Livrare</h3>

                            {/* Email Confirmare - Full Width */}
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="email@exemplu.com"
                                    value={userData.email}
                                    onChange={e=>setUserData({...userData, email:e.target.value})}
                                />
                            </div>

                            {/* Tabs Metodă Livrare */}
                            <div className="delivery-tabs">
                                <button
                                    className={`tab-btn ${deliveryMethod==="home"?"active":""}`}
                                    onClick={()=>setDeliveryMethod("home")}
                                >
                                    <i className="fas fa-truck"></i> Curier
                                </button>
                                <button
                                    className={`tab-btn ${deliveryMethod==="easybox"?"active":""}`}
                                    onClick={()=>setDeliveryMethod("easybox")}
                                >
                                    <i className="fas fa-box"></i> Easybox
                                </button>
                            </div>

                            {/* Conținut Tab-uri */}
                            {deliveryMethod === "home" ? (
                                <div className="address-form animate-fade">
                                    <div className="form-group">
                                        <label>Nume</label>
                                        <input type="text" placeholder="Nume" value={userData.nume} onChange={e=>setUserData({...userData, nume:e.target.value})} />
                                    </div>

                                    <div className="form-group">
                                        <label>Telefon</label>
                                        <input type="text" placeholder="Telefon" value={userData.telefon} onChange={e=>setUserData({...userData, telefon:e.target.value})} />
                                    </div>

                                    <div className="form-group">
                                        <label>Oraș</label>
                                        <input type="text" placeholder="Oraș" value={userData.oras} onChange={e=>setUserData({...userData, oras:e.target.value})} />
                                    </div>

                                    <div className="form-group">
                                        <label>Județ</label>
                                        <input type="text" placeholder="Județ" value={userData.judet} onChange={e=>setUserData({...userData, judet:e.target.value})} />
                                    </div>

                                    <div className="form-group">
                                        <label>Adresa completă</label>
                                        <textarea
                                            placeholder="Adresa completa (Strada, Nr, Bloc, Scara...)"
                                            value={userData.adresa}
                                            onChange={e=>setUserData({...userData, adresa:e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                            ) : (
                                <div className="easybox-container animate-fade">
                                    <div className="city-search-row">
                                        <input
                                            type="text"
                                            placeholder="Caută oraș (ex: Cluj)..."
                                            value={citySearch}
                                            onChange={e=>setCitySearch(e.target.value)}
                                        />
                                        <button onClick={handleCitySearch}>Caută</button>
                                    </div>
                                    <div className="map-wrapper" style={{height:300}}>
                                        <MapContainer center={mapCenter} zoom={13} style={{height:'100%'}}>
                                            <ChangeView center={mapCenter} />
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                            {lockers.map(l => (
                                                <Marker
                                                    key={l.id}
                                                    position={[l.lat, l.lng]}
                                                    icon={customMarkerIcon}
                                                    eventHandlers={{click: () => handleMarkerClick(l)}}
                                                >
                                                    <Popup>Click pentru a selecta</Popup>
                                                </Marker>
                                            ))}
                                        </MapContainer>
                                    </div>
                                    {selectedLocker ? (
                                        <p className="selected-locker-info success">
                                            📍 Locker Selectat: <strong>{selectedLocker.name}</strong>
                                        </p>
                                    ) : (
                                        <p className="selected-locker-info warning">
                                            ⚠️ Te rugăm să selectezi un Easybox de pe hartă.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Metodă Plată */}
                            <h3 style={{marginTop:'25px', borderTop:'1px solid #F0B49A', paddingTop:'18px'}}>Metodă de plată</h3>
                            <div className="payment-options">
                                <label className="checkbox-container">
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod==="card"}
                                        onChange={()=>setPaymentMethod("card")}
                                    />
                                    Card Online
                                </label>
                                <label className="checkbox-container">
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod==="cash"}
                                        onChange={()=>setPaymentMethod("cash")}
                                    />
                                    Ramburs la livrare
                                </label>
                            </div>

                            {paymentMethod === "card" && (
                                <div className="card-form animate-fade" style={{marginTop:'12px'}}>
                                    <div className="form-group">
                                        <label>Număr Card</label>
                                        <input
                                            type="text"
                                            placeholder="XXXX XXXX XXXX XXXX"
                                            value={cardDetails.number}
                                            onChange={e=>setCardDetails({...cardDetails, number:e.target.value})}
                                        />
                                    </div>

                                    <div className="card-row">
                                        <div className="form-group" style={{flex: 1}}>
                                            <label>Data expirării</label>
                                            <input
                                                type="text"
                                                placeholder="MM / YY"
                                                className="card-expiry"
                                                value={cardDetails.expiry}
                                                onChange={e=>setCardDetails({...cardDetails, expiry:e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group" style={{flex: 1}}>
                                            <label>CVV</label>
                                            <input
                                                type="text"
                                                placeholder="CVV"
                                                className="card-cvv"
                                                value={cardDetails.cvv}
                                                onChange={e=>setCardDetails({...cardDetails, cvv:e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- SECȚIUNEA DREAPTĂ (Sumar) --- */}
                    <div className="cart-right-section">
                        <div className="cart-summary sticky-summary">
                            <h3>Sumar Comandă</h3>
                            <div className="summary-row">
                                <span>Produse ({cartItems.length}):</span>
                                <span>{cartTotal.toFixed(2)} Lei</span>
                            </div>
                            <div className="summary-row">
                                <span>Livrare:</span>
                                <span>{cartTotal > 200 ? "Gratuit" : "15.00 Lei"}</span>
                            </div>

                            <div className="summary-row total">
                                <span>TOTAL:</span>
                                <span>
                                    {(cartTotal + (cartTotal > 200 ? 0 : 15)).toFixed(2)} Lei
                                </span>
                            </div>

                            {/* BUTONUL PRINCIPAL care apelează FACADE-ul */}
                            <button
                                className="checkout-btn"
                                onClick={handleCheckoutClick}
                                disabled={isProcessing}
                                style={{ opacity: isProcessing ? 0.7 : 1 }}
                            >
                                {isProcessing ? (
                                    <span><i className="fas fa-spinner fa-spin"></i> Se procesează...</span>
                                ) : (
                                    "Trimite Comanda"
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}