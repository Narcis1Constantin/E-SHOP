import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import './ContactPage.css';

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Coordonate EXACTE Strada Olari, Bloc 16, Târgu-Jiu
const LOCATION = {
    lat: 45.027556,
    lng: 23.279722
};

export default function ContactPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            const response = await fetch('http://localhost:3002/api/contact/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Eroare la trimiterea mesajului');
            }

            // Success
            setSubmitMessage({
                type: 'success',
                text: '✓ Mesajul a fost trimis cu succes! Vei primi un răspuns în maxim 24 de ore.'
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });

        } catch (error) {
            setSubmitMessage({
                type: 'error',
                text: `✕ ${error.message}`
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page-wrapper">
            {/* Header */}
            <div className="contact-header">
                <button onClick={() => navigate('/shop')} className="back-button">
                    ← Înapoi la magazin
                </button>
                <h1>Contactează-ne</h1>
                <p>Suntem aici să te ajutăm cu orice întrebare!</p>
            </div>

            <div className="contact-content">
                {/* Contact Cards */}
                <div className="contact-cards">
                    {/* Email Card */}
                    <div className="contact-card">
                        <div className="card-icon email-icon">
                            <i className="fas fa-envelope"></i>
                        </div>
                        <h3>Email</h3>
                        <a href="mailto:eshop2025is@gmail.com" className="contact-link">
                            eshop2025is@gmail.com
                        </a>
                        <p className="card-description">
                            Răspundem în maxim 24 de ore
                        </p>
                    </div>

                    {/* Telefon Card */}
                    <div className="contact-card">
                        <div className="card-icon phone-icon">
                            <i className="fas fa-phone-alt"></i>
                        </div>
                        <h3>Telefon</h3>
                        <a href="tel:+40712345678" className="contact-link">
                            0712 345 678
                        </a>
                        <p className="card-description">
                            Luni - Vineri, 9:00 - 18:00
                        </p>
                    </div>

                    {/* Adresă Card */}
                    <div className="contact-card">
                        <div className="card-icon location-icon">
                            <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <h3>Adresă</h3>
                        <p className="contact-link">
                            Strada Olari, Bloc 16, Scara 1<br />
                            Târgu-Jiu, Gorj
                        </p>
                        <p className="card-description">
                            Program: L-V 9:00 - 18:00
                        </p>
                    </div>
                </div>

                {/* Map Section */}
                <div className="map-section">
                    <h2>Unde ne găsești</h2>
                    <div className="map-container">
                        <MapContainer
                            center={[LOCATION.lat, LOCATION.lng]}
                            zoom={17}
                            style={{ height: '400px', width: '100%', borderRadius: '12px' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <Marker position={[LOCATION.lat, LOCATION.lng]} icon={customIcon}>
                                <Popup>
                                    <strong>SmartDepot</strong><br />
                                    Strada Olari, Bloc 16, Scara 1<br />
                                    Târgu-Jiu, Gorj
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>

                {/* Quick Contact Form */}
                <div className="quick-contact-section">
                    <h2>Trimite-ne un mesaj rapid</h2>

                    {submitMessage.text && (
                        <div className={`form-message ${submitMessage.type}`}>
                            {submitMessage.text}
                        </div>
                    )}

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nume complet *</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ion Popescu"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="ion@exemplu.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Subiect *</label>
                            <input
                                type="text"
                                name="subject"
                                placeholder="Despre ce vrei să discutăm?"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label>Mesaj *</label>
                            <textarea
                                rows="5"
                                name="message"
                                placeholder="Scrie-ne mesajul tău aici..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Se trimite...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i> Trimite mesaj
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* FAQ Section */}
                <div className="faq-section">
                    <h2>Întrebări frecvente</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>📦 Cum pot urmări comanda?</h4>
                            <p>Accesează secțiunea "Contul meu" → "Comenzi" pentru a vedea statusul comenzii tale.</p>
                        </div>
                        <div className="faq-item">
                            <h4>🔄 Pot returna un produs?</h4>
                            <p>Da! Ai 14 zile pentru a returna produsul. Apasă "Returnează comanda" în secțiunea de comenzi.</p>
                        </div>
                        <div className="faq-item">
                            <h4>💳 Ce metode de plată acceptați?</h4>
                            <p>Acceptăm plata cu cardul online (Stripe) și ramburs la livrare.</p>
                        </div>
                        <div className="faq-item">
                            <h4>🚚 Cât durează livrarea?</h4>
                            <p>Livrarea standard durează 2-3 zile lucrătoare de la plasarea comenzii.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}