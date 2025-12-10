// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// // IMPORTURI CORECTATE
// import { useCart } from "../CartContext";
// import "../CartPage.css";
//
// // Iconiță Leaflet
// const customMarkerIcon = new L.Icon({
//     iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//     shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41]
// });
//
// function ChangeView({ center }) {
//     const map = useMap();
//     map.setView(center, 13);
//     return null;
// }
//
// export default function CartPage() {
//     const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
//     const navigate = useNavigate();
//     const [isProcessing, setIsProcessing] = useState(false);
//
//     const [userData, setUserData] = useState({
//         nume: "", email: "", telefon: "", judet: "", oras: "", adresa: ""
//     });
//
//     const [deliveryMethod, setDeliveryMethod] = useState("home");
//     const [paymentMethod, setPaymentMethod] = useState("card");
//     const [selectedLocker, setSelectedLocker] = useState(null);
//     const [mapCenter, setMapCenter] = useState([44.4268, 26.1025]);
//     const [lockers, setLockers] = useState([]);
//
//     useEffect(() => {
//         // Generăm lockere fictive
//         const mocks = Array.from({length: 5}).map((_, i) => ({
//             id: i, name: `Easybox ${i+1}`, lat: 44.4268 + (Math.random()-0.5)*0.05, lng: 26.1025 + (Math.random()-0.5)*0.05
//         }));
//         setLockers(mocks);
//     }, []);
//
//     const handleCheckout = async () => {
//         if (!userData.email) return alert("Email obligatoriu!");
//         setIsProcessing(true);
//
//         try {
//             const finalAddress = deliveryMethod === "home"
//                 ? `${userData.adresa}, ${userData.oras}`
//                 : `Easybox: ${selectedLocker?.name || 'Nedefinit'}`;
//
//             const token = localStorage.getItem("authToken");
//
//             // TRIMITEM ȘI PRODUSELE (items) PENTRU CĂ BACKEND-UL NU LE ARE ÎN DB
//             const response = await fetch("http://localhost:3002/api/orders/place", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     address: finalAddress,
//                     email: userData.email,
//                     paymentMethod: paymentMethod,
//                     items: cartItems // <--- IMPORTANT: Trimitem produsele din coș
//                 })
//             });
//
//             const result = await response.json();
//             if (!response.ok) throw new Error(result.error || "Eroare comandă");
//
//             alert("Comanda a fost plasată cu succes!");
//             clearCart();
//             navigate("/");
//
//         } catch (err) {
//             alert(err.message);
//         } finally {
//             setIsProcessing(false);
//         }
//     };
//
//     if (cartItems.length === 0) return <div className="cart-page-wrapper empty-state"><h2>Coș gol</h2><button onClick={()=>navigate("/")}>Înapoi</button></div>;
//
//     return (
//         <div className="cart-page-wrapper">
//             <h1>Finalizare Comandă</h1>
//             <div className="cart-layout">
//                 {/* LISTA DE PRODUSE */}
//                 <div className="section-box">
//                     {cartItems.map(item => (
//                         <div key={item.id} className="cart-item">
//                             <span>{item.title}</span>
//                             <span>{item.price} Lei x {item.quantity}</span>
//                             <button onClick={()=>removeFromCart(item.id)}>Șterge</button>
//                         </div>
//                     ))}
//                 </div>
//
//                 {/* FORMULAR DATE */}
//                 <div className="section-box">
//                     <input type="email" placeholder="Email confirmare *" value={userData.email} onChange={e=>setUserData({...userData, email:e.target.value})} style={{width:'100%', marginBottom: 10}} />
//
//                     <div className="delivery-tabs">
//                         <button onClick={()=>setDeliveryMethod("home")} className={deliveryMethod==="home"?"active":""}>Curier</button>
//                         <button onClick={()=>setDeliveryMethod("easybox")} className={deliveryMethod==="easybox"?"active":""}>Easybox</button>
//                     </div>
//
//                     {deliveryMethod === "home" ? (
//                         <input type="text" placeholder="Adresa completă" value={userData.adresa} onChange={e=>setUserData({...userData, adresa:e.target.value})} style={{width:'100%'}} />
//                     ) : (
//                         <div style={{height: 300, width: '100%'}}>
//                             <MapContainer center={mapCenter} zoom={13} style={{height:'100%'}}>
//                                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
//                                 {lockers.map(l => (
//                                     <Marker key={l.id} position={[l.lat, l.lng]} icon={customMarkerIcon} eventHandlers={{click: () => setSelectedLocker(l)}} />
//                                 ))}
//                             </MapContainer>
//                             {selectedLocker && <p>Selectat: {selectedLocker.name}</p>}
//                         </div>
//                     )}
//                 </div>
//
//                 {/* BUTON FINALIZARE */}
//                 <button className="checkout-btn" onClick={handleCheckout} disabled={isProcessing}>
//                     {isProcessing ? "Se trimite..." : `Trimite Comanda (${cartTotal.toFixed(2)} Lei)`}
//                 </button>
//             </div>
//         </div>
//     );
// }