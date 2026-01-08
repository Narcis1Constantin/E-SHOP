import React from "react";

export default function AuthPageView({
                                         activeTab,
                                         setActiveTab,
                                         loginData,
                                         registerData,
                                         setLoginData,
                                         setRegisterData,
                                         message,
                                         clearMessage,
                                         handleLoginSubmit,
                                         handleRegisterSubmit,
                                         handleResetSubmit,
                                         showPassword,
                                         setShowPassword,
                                         resetStep,
                                         setResetStep,
                                         resetCode,
                                         setResetCode,
                                         newPassword,
                                         setNewPassword,
                                         confirmPassword,
                                         setConfirmPassword,
                                         handleVerifyCode,
                                         handleSetNewPassword,
                                     }) {
    const isPasswordError = (text) => {
        if (!text) return false;

        const lowerText = text.toLowerCase();

        const passwordKeywords = [
            'parol', 'password', 'parola', 'parolă',
            'autentificare', 'authentication', 'credentiale',
            'incorect', 'incorrect', 'gresit', 'greșit'
        ];

        return passwordKeywords.some(keyword => lowerText.includes(keyword));
    };

    return (
        <div className="page-wrapper">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>SmartDepot</h1>
                </div>

                <div className="auth-tabs">
                    <button
                        className={activeTab === "login" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("login");
                            clearMessage();
                        }}
                        id="tab-login"
                    >
                        Login
                    </button>
                    <button
                        className={activeTab === "register" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("register");
                            clearMessage();
                        }}
                        id="tab-register"
                    >
                        Creare Cont
                    </button>
                </div>

                <div className="form-panel">
                    {/* FORMULAR LOGIN */}
                    {activeTab === "login" && (
                        <form id="login-form" onSubmit={handleLoginSubmit}>

                            {/* TAB-URI EMAIL / TELEFON */}
                            <div className="login-subtabs">
                                <button
                                    type="button"
                                    className={loginData.type === "email" ? "active" : ""}
                                    onClick={() => {
                                        setLoginData({ ...loginData, type: "email", phone: "" });
                                        clearMessage();
                                    }}
                                >
                                    Email
                                </button>

                                <button
                                    type="button"
                                    className={loginData.type === "phone" ? "active" : ""}
                                    onClick={() => {
                                        setLoginData({ ...loginData, type: "phone", email: "" });
                                        clearMessage();
                                    }}
                                >
                                    Telefon
                                </button>
                            </div>

                            {/* INPUT EMAIL */}
                            {loginData.type === "email" && (
                                <>
                                    <label htmlFor="log-email">Email</label>
                                    <input
                                        id="log-email"
                                        name="email"
                                        type="email"
                                        placeholder="email@exemplu.com"
                                        value={loginData.email}
                                        onChange={(e) =>
                                            setLoginData({ ...loginData, email: e.target.value })
                                        }
                                    />
                                </>
                            )}

                            {/* INPUT TELEFON */}
                            {loginData.type === "phone" && (
                                <>
                                    <label htmlFor="log-phone">Telefon</label>
                                    <input
                                        id="log-phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+407..."
                                        value={loginData.phone}
                                        onChange={(e) =>
                                            setLoginData({ ...loginData, phone: e.target.value })
                                        }
                                    />
                                </>
                            )}

                            {/* PAROLA */}
                            {loginData.type && (
                                <>
                                    <label htmlFor="log-password">Parolă</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            id="log-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Parola"
                                            value={loginData.password}
                                            onChange={(e) =>
                                                setLoginData({ ...loginData, password: e.target.value })
                                            }
                                            style={{ paddingRight: "45px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="password-toggle-btn"
                                            title={showPassword ? "Ascunde parola" : "Arată parola"}
                                        >
                                            {showPassword ? (
                                                // ochi cu linie
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                // ochi deschis
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}

                            <button type="submit" className="submit-btn">
                                Intră în cont
                            </button>
                        </form>
                    )}

                    {/* FORMULAR REGISTER */}
                    {activeTab === "register" && (
                        <form id="register-form" onSubmit={handleRegisterSubmit}>

                            <label htmlFor="reg-name">Nume</label>
                            <input
                                id="reg-name"
                                name="name"
                                type="text"
                                placeholder="Numele tău complet"
                                value={registerData.name}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, name: e.target.value })
                                }
                            />

                            <label htmlFor="reg-email">Email</label>
                            <input
                                id="reg-email"
                                name="email"
                                type="email"
                                placeholder="email@exemplu.com"
                                value={registerData.email}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, email: e.target.value })
                                }
                            />

                            <label htmlFor="reg-phone">Telefon</label>
                            <input
                                id="reg-phone"
                                name="phone"
                                type="tel"
                                placeholder="+407..."
                                value={registerData.phone}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, phone: e.target.value })
                                }
                            />

                            <label htmlFor="reg-address">Adresă</label>
                            <input
                                id="reg-address"
                                name="address"
                                type="text"
                                placeholder="Strada, număr, oraș"
                                value={registerData.address}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        address: e.target.value,
                                    })
                                }
                            />

                            <label htmlFor="reg-password">Parolă</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    id="reg-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minim 6 caractere"
                                    value={registerData.password}
                                    onChange={(e) =>
                                        setRegisterData({
                                            ...registerData,
                                            password: e.target.value,
                                        })
                                    }
                                    style={{ paddingRight: "45px" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle-btn"
                                    title={showPassword ? "Ascunde parola" : "Arată parola"}
                                >
                                    {showPassword ? (
                                        //ochi cu linie
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        // ochi deschis
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <button type="submit" className="submit-btn">
                                Creează Cont
                            </button>
                        </form>
                    )}

                    {/* FORMULAR RESET  */}
                    {activeTab === "reset" && (
                        <>
                            {/* STEP 1: introduce email */}
                            {resetStep === 1 && (
                                <form id="reset-form-step1" onSubmit={handleResetSubmit}>
                                    <h3>Resetare Parolă</h3>
                                    <p style={{ fontSize: "0.9rem", color: "#666" }}>
                                        Introdu adresa de email și vei primi un cod de verificare.
                                    </p>

                                    <label htmlFor="reset-email">Email</label>
                                    <input
                                        id="reset-email"
                                        type="email"
                                        placeholder="email@exemplu.com"
                                        value={loginData.email}
                                        onChange={(e) =>
                                            setLoginData({ ...loginData, email: e.target.value })
                                        }
                                        required
                                    />

                                    <button type="submit" className="submit-btn">
                                        Trimite cod
                                    </button>
                                </form>
                            )}

                            {/* STEP 2: introduce cod de 6 cifre */}
                            {resetStep === 2 && (
                                <form id="reset-form-step2" onSubmit={handleVerifyCode}>
                                    <h3 style={{ marginTop: 0, color: "#333" }}>Resetare Parolă</h3>
                                    <p style={{ fontSize: "0.9rem", color: "#666" }}>
                                        Introdu codul de 6 cifre primit pe email.
                                    </p>

                                    <label htmlFor="reset-code">Cod de verificare</label>
                                    <input
                                        id="reset-code"
                                        type="text"
                                        placeholder="123456"
                                        maxLength="6"
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                                        required
                                        style={{
                                            fontSize: "1.5rem",
                                            letterSpacing: "0.5rem",
                                            textAlign: "center"
                                        }}
                                    />

                                    <button type="submit" className="submit-btn">
                                        Verifică cod
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setResetStep(1)}
                                        style={{
                                            marginTop: "0.5rem",
                                            background: "transparent",
                                            color: "#666",
                                            border: "none",
                                            cursor: "pointer",
                                            textDecoration: "underline"
                                        }}
                                    >
                                        ← Înapoi
                                    </button>
                                </form>
                            )}

                            {/* STEP 3: seteaza parola noua */}
                            {resetStep === 3 && (
                                <form id="reset-form-step3" onSubmit={handleSetNewPassword}>
                                    <h3 style={{ marginTop: 0, color: "#333" }}>Resetare Parolă - Pas 3</h3>
                                    <p style={{ fontSize: "0.9rem", color: "#666" }}>
                                        Setează noua ta parolă.
                                    </p>

                                    <label htmlFor="new-password">Parolă nouă</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            id="new-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Minim 6 caractere"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            style={{ paddingRight: "45px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="password-toggle-btn"
                                            title={showPassword ? "Ascunde parola" : "Arată parola"}
                                        >
                                            {showPassword ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    <label htmlFor="confirm-password">Confirmă parola</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            id="confirm-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Repetă parola"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            style={{ paddingRight: "45px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="password-toggle-btn"
                                            title={showPassword ? "Ascunde parola" : "Arată parola"}
                                        >
                                            {showPassword ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    <button type="submit" className="submit-btn">
                                        Resetează parola
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setResetStep(2)}
                                        style={{
                                            marginTop: "0.5rem",
                                            background: "transparent",
                                            color: "#666",
                                            border: "none",
                                            cursor: "pointer",
                                            textDecoration: "underline"
                                        }}
                                    >
                                        ← Înapoi
                                    </button>
                                </form>
                            )}
                        </>
                    )}

                    {/* MESAJE AUTH */}
                    {message.text && (
                        <div className="auth-message-wrapper">
                            <div
                                className={`auth-message-area ${
                                    message.type === "error"
                                        ? "auth-error"
                                        : message.type === "success"
                                            ? "auth-success"
                                            : ""
                                }`}
                            >
                                <div className="auth-message-text">
                                    {message.text}
                                </div>
                                {message.type === "error" &&
                                    activeTab === "login" &&
                                    isPasswordError(message.text) && (
                                        <div
                                            className="auth-reset-password-link"
                                            onClick={() => {
                                                setActiveTab("reset");
                                                setResetStep(1);
                                                clearMessage();
                                            }}
                                        >
                                            🔑 Ai uitat parola?
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}