import React from "react";

export default function AccountProfile({ user, setUser, handleUpdateSubmit, message }) {
    return (
        <form onSubmit={handleUpdateSubmit} className="account-form">

            {/* NUME COMPLET */}
            <div className="form-row">
                <label>Nume complet:</label>
                <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
            </div>

            {/* EMAIL */}
            <div className="form-row">
                <label>Email:</label>
                <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
            </div>

            {/* TELEFON */}
            <div className="form-row">
                <label>Telefon:</label>
                <input
                    type="text"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
            </div>

            {/* ADRESA */}
            <div className="form-row">
                <label>Adresă:</label>
                <input
                    type="text"
                    value={user.address}
                    onChange={(e) => setUser({ ...user, address: e.target.value })}
                />
            </div>

            <button className="submit-btn">Salvează modificările</button>

            {message.text && (
                <div className={`message-area ${message.type}`}>
                    {message.text}
                </div>
            )}
        </form>
    );
}
