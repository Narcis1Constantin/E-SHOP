import React from "react";
import "../MyAccountPage.css";

export default function ResetPasswordPageView({
                                                  password,
                                                  confirm,
                                                  setPassword,
                                                  setConfirm,
                                                  message,
                                                  error,
                                                  handleSubmit
                                              }) {
    return (
        <div className="page-wrapper">
            <div className="auth-container">

                <div className="auth-header">
                    <h1>
                        e<span>-shop</span>
                    </h1>
                </div>

                <div className="form-panel">
                    <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                        Resetează parola
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <label>Parolă nouă</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Noua parolă"
                            required
                        />

                        <label>Confirmă parola</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Confirmă parola"
                            required
                        />

                        <button className="submit-btn">Resetează parola</button>
                    </form>

                    {/* Mesaje */}
                    {message && (
                        <div className="message-area success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="message-area error">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
