import React from "react";

export default function AccountResetPassword({
                                                 newPassword,
                                                 confirmPassword,
                                                 setNewPassword,
                                                 setConfirmPassword,
                                                 handleChangePassword,
                                                 message
                                             }) {
    return (
        <div className="account-section">

            <form onSubmit={handleChangePassword} className="account-form">

                {/* PAROLA NOUĂ */}
                <div className="form-row">
                    <label>Parolă nouă:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Introdu parola nouă"
                    />
                </div>

                {/* CONFIRMĂ PAROLA */}
                <div className="form-row">
                    <label>Confirmă parola:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmă parola"
                    />
                </div>

                <button className="submit-btn">Actualizează parola</button>

                {message?.text && (
                    <div className={`message-area ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
}
