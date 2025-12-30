import React from "react";

export default function AccountProfile({ user, setUser, handleUpdateSubmit, message }) {
    return (
        <div className="orders-wrapper">
            <div className="orders-header">
                <h1>Profilul meu</h1>
            </div>

            <div className="orders-content">
                <form onSubmit={handleUpdateSubmit} className="account-form">

                    {/* NUME COMPLET */}
                    <div className="form-row">
                        <label>Nume complet:</label>
                        <input
                            type="text"
                            value={user.name || ''}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                            placeholder="Introduceți numele complet (ex: Ion Popescu)"
                            required
                            pattern="[A-Za-zĂăÂâÎîȘșȚț\s]{2,}\s+[A-Za-zĂăÂâÎîȘșȚț\s]{2,}"
                            title="Introduceți prenume și nume (minim 2 caractere fiecare)"
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="form-row">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={user.email || ''}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            placeholder="Introduceți email-ul (ex: nume@email.com)"
                            required
                            title="Introduceți o adresă de email validă"
                        />
                    </div>

                    {/* TELEFON */}
                    <div className="form-row">
                        <label>Telefon:</label>
                        <input
                            type="tel"
                            value={user.phone || ''}
                            onChange={(e) => setUser({ ...user, phone: e.target.value })}
                            placeholder="Introduceți telefonul (ex: 0712345678)"
                            required
                            pattern="[0-9\s\-\+\(\)]{10,}"
                            title="Introduceți un număr de telefon valid (minim 10 cifre)"
                        />
                    </div>

                    {/* ADRESA */}
                    <div className="form-row">
                        <label>Adresă:</label>
                        <input
                            type="text"
                            value={user.address || ''}
                            onChange={(e) => setUser({ ...user, address: e.target.value })}
                            placeholder="Introduceți adresa (ex: Str. Avram Iancu nr. 5)"
                            required
                            minLength="10"
                            title="Introduceți o adresă completă (minim 10 caractere)"
                        />
                    </div>

                    <button className="submit-btn">Salvează modificările</button>

                    {message.text && (
                        <div className={`message-area ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}