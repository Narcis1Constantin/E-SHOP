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
                                     }) {

    return (
        <div className="page-wrapper">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>
                        e<span>-shop</span>
                    </h1>
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
                                    onClick={() => setLoginData({ ...loginData, type: "email", phone: "" })}
                                >
                                    Email
                                </button>

                                <button
                                    type="button"
                                    className={loginData.type === "phone" ? "active" : ""}
                                    onClick={() => setLoginData({ ...loginData, type: "phone", email: "" })}
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

                            {/* PAROLA - DOAR DUPĂ SELECTARE */}
                            {loginData.type && (
                                <>
                                    <label htmlFor="log-password">Parolă</label>
                                    <input
                                        id="log-password"
                                        name="password"
                                        type="password"
                                        placeholder="Parola"
                                        value={loginData.password}
                                        onChange={(e) =>
                                            setLoginData({ ...loginData, password: e.target.value })
                                        }
                                    />
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
                            <input
                                id="reg-password"
                                name="password"
                                type="password"
                                placeholder="Minim 6 caractere"
                                value={registerData.password}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        password: e.target.value,
                                    })
                                }
                            />

                            <button type="submit" className="submit-btn">
                                Creează Cont
                            </button>
                        </form>
                    )}
                    {/* RESET */}
                    {activeTab === "reset" && (
                        <form id="reset-form" onSubmit={handleResetSubmit}>
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
                                Trimite link resetare
                            </button>
                        </form>
                    )}
                    {message.text && (
                        <div className={`message-area ${
                            message.type === "error"
                                ? "error"
                                : message.type === "success"
                                    ? "success"
                                    : ""
                        }`}>
                            {message.text}

                            {message.type === "error" && message.text.toLowerCase().includes("parol") && (
                                <div
                                    onClick={() => {
                                        setActiveTab("reset");
                                        clearMessage();
                                    }}
                                    style={{
                                        marginTop: "8px",
                                        fontSize: "13px",
                                        color: "#007bff",
                                        cursor: "pointer",
                                        textDecoration: "underline"
                                    }}
                                >
                                    Actualizează parola
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}