import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCart } from "../CartContext";
import "../CartPage.css";

// Iconiță Leaflet
const customMarkerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Componenta care mișcă harta
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const [userData, setUserData] = useState({ nume: "", email: "", telefon: "", judet: "", oras: "", adresa: "" });
    const [deliveryMethod, setDeliveryMethod] = useState("home");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });

    // Harta
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [mapCenter, setMapCenter] = useState([44.4268, 26.1025]); // Default București
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

                // Actualizăm harta
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
        } catch(e) { setSelectedLocker({...locker, name: "Easybox - Adresă indisponibilă"}); }
    };

    const handleCheckout = async () => {
        if (!userData.email) return alert("Email obligatoriu!");
        if (deliveryMethod === "home" && !userData.adresa) return alert("Adresă lipsă!");
        if (deliveryMethod === "easybox" && (!selectedLocker || selectedLocker.name.includes("Se caută"))) return alert("Alege Easybox!");

        setIsProcessing(true);
        try {
            const finalAddress = deliveryMethod === "home" ? `${userData.adresa}, ${userData.oras}` : selectedLocker.name;
            const token = localStorage.getItem("authToken");

            const response = await fetch("http://localhost:3002/api/orders/place", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    address: finalAddress,
                    email: userData.email,
                    paymentMethod,
                    items: cartItems
                })
            });

            const res = await response.json();
            if (!response.ok) throw new Error(res.error);

            alert(`Succes! Comanda #${res.orderId} a fost plasată.`);
            clearCart();
            navigate("/");
        } catch (err) { alert(`Eroare: ${err.message}`); }
        finally { setIsProcessing(false); }
    };

    if (cartItems.length === 0) return <div className="cart-page-wrapper empty-state"><h2>Coș gol</h2><button onClick={()=>navigate("/")}>Înapoi</button></div>;

    return (
        <div className="cart-page-wrapper">
            <h1>Finalizare Comandă</h1>
            <div className="cart-layout">
                <div className="cart-left-section">
                    <div className="section-box cart-items-box">
                        <h3>Produse</h3>
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-details"><h4>{item.title}</h4><p>{item.price} Lei</p></div>
                                <div className="quantity-controls">
                                    <button onClick={()=>updateQuantity(item.id, -1)}>-</button><span>{item.quantity}</span><button onClick={()=>updateQuantity(item.id, 1)}>+</button>
                                </div>
                                <div className="item-total">{(item.price*item.quantity).toFixed(2)} Lei</div>
                                <button className="remove-btn" onClick={()=>removeFromCart(item.id)}><i className="fas fa-trash"></i></button>
                            </div>
                        ))}
                    </div>

                    <div className="section-box delivery-box">
                        <h3>Livrare</h3>
                        <div className="form-row"><input type="email" placeholder="Email confirmare *" value={userData.email} onChange={e=>setUserData({...userData, email:e.target.value})} style={{width:'100%'}}/></div>

                        <div className="delivery-tabs">
                            <button className={`tab-btn ${deliveryMethod==="home"?"active":""}`} onClick={()=>setDeliveryMethod("home")}>Curier</button>
                            <button className={`tab-btn ${deliveryMethod==="easybox"?"active":""}`} onClick={()=>setDeliveryMethod("easybox")}>Easybox</button>
                        </div>

                        {deliveryMethod === "home" ? (
                            <div className="address-form">
                                <input type="text" placeholder="Nume" onChange={e=>setUserData({...userData, nume:e.target.value})} />
                                <input type="text" placeholder="Telefon" onChange={e=>setUserData({...userData, telefon:e.target.value})} />
                                <textarea placeholder="Adresa completa" onChange={e=>setUserData({...userData, adresa:e.target.value})}></textarea>
                            </div>
                        ) : (
                            <div className="easybox-container">
                                <div className="city-search-row">
                                    <input type="text" placeholder="Caută oraș (ex: Cluj)..." value={citySearch} onChange={e=>setCitySearch(e.target.value)} />
                                    <button onClick={handleCitySearch}>Caută</button>
                                </div>
                                <div className="map-wrapper" style={{height:300}}>
                                    <MapContainer center={mapCenter} zoom={13} style={{height:'100%'}}>

                                        {/* FIX-UL PENTRU HARTA: ChangeView trebuie să fie AICI */}
                                        <ChangeView center={mapCenter} />

                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                        {lockers.map(l => (
                                            <Marker key={l.id} position={[l.lat, l.lng]} icon={customMarkerIcon} eventHandlers={{click: () => handleMarkerClick(l)}}>
                                                <Popup>Click pentru adresă</Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                </div>
                                {selectedLocker && <p className="selected-locker-info success">📍 {selectedLocker.name}</p>}
                            </div>
                        )}

                        <div className="payment-options" style={{marginTop:20}}>
                            <label><input type="radio" checked={paymentMethod==="card"} onChange={()=>setPaymentMethod("card")}/> Card</label>
                            <label><input type="radio" checked={paymentMethod==="cash"} onChange={()=>setPaymentMethod("cash")}/> Ramburs</label>
                        </div>
                        {paymentMethod === "card" && <div className="card-form"><input type="text" placeholder="Nr. Card" value={cardDetails.number} onChange={e=>setCardDetails({...cardDetails, number:e.target.value})} /></div>}
                    </div>
                </div>

                <div className="cart-right-section">
                    <div className="cart-summary sticky-summary">
                        <h3>Total: {cartTotal.toFixed(2)} Lei</h3>
                        <button className="checkout-btn" onClick={handleCheckout} disabled={isProcessing}>
                            {isProcessing ? "Se procesează..." : "Trimite Comanda"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}