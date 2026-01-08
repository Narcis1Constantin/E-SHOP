import React, { useState } from "react";
import "../AuthPage.css";
import AuthPageView from "../views/AuthPageView";

const API_BASE_URL = "http://localhost:3002/api";

export default function AuthPage({ onLoginSuccess }) {
    const [activeTab, setActiveTab] = useState("login");

    const [showPassword, setShowPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // state pentru formulare
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
        type: "email"
    });

    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
    });

    // zona de mesaje
    const [message, setMessage] = useState({
        text: "",
        type: "",
    });

    const showMessage = (text, type = "") => {
        setMessage({ text, type });
    };

    const clearMessage = () => {
        setMessage({ text: "", type: "" });
    };

    const apiCall = async (url, bodyData) => {
        showMessage("Se trimite cererea...", "");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMsg =
                    result.error ||
                    (result.errors
                        ? result.errors.map((e) => e.msg).join(", ")
                        : "Eroare necunoscută");

                showMessage(`Eroare: ${errorMsg}`, "error");
                return false;
            }

            if (result.token) {
                localStorage.setItem("authToken", result.token);

                if (result.user) {
                    localStorage.setItem("userName", result.user.name);
                    localStorage.setItem("userEmail", result.user.email);
                } else {
                    localStorage.setItem("userName", "Client SmartDepot");
                    localStorage.setItem("userEmail", bodyData.email);
                }
            }

            showMessage("Succes!", "success");

            if (url.includes("register")) {
                setActiveTab("login");
                setLoginData({
                    ...loginData,
                    email: bodyData.email,
                    password: bodyData.password,
                });
            }

            return true;
        } catch (err) {
            showMessage("Eroare de conexiune la server.", "error");
            return false;
        }
    };

    // SUBMIT REGISTER
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const data = { ...registerData };
        await apiCall(`${API_BASE_URL}/auth/register`, data);
    };

    // SUBMIT LOGIN
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const data = { ...loginData };

        if (data.type === "email") {
            delete data.phone;
        }

        if (data.type === "phone") {
            delete data.email;
        }

        const success = await apiCall(`${API_BASE_URL}/auth/login`, data);

        if (success) {
            setTimeout(() => {
                onLoginSuccess();
            }, 500);
        }
    };

    // RESET PASSWORD - STEP 1: Trimite cod pe email
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        clearMessage();

        if (!loginData.email) {
            showMessage("Introdu emailul pentru resetare", "error");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginData.email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Eroare server");

            showMessage("Cod de resetare trimis pe email!", "success");
            setResetStep(2);
        } catch (err) {
            showMessage(err.message, "error");
        }
    };

    // RESET PASSWORD - STEP 2: Verifică codul
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        clearMessage();

        if (resetCode.length !== 6) {
            showMessage("Codul trebuie să aibă 6 cifre", "error");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: loginData.email,
                    code: resetCode
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Cod invalid");

            showMessage("Cod valid! Setează parola nouă.", "success");
            setResetStep(3);
        } catch (err) {
            showMessage(err.message, "error");
        }
    };

    // RESET PASSWORD - STEP 3: Setează parola nouă
    const handleSetNewPassword = async (e) => {
        e.preventDefault();
        clearMessage();

        if (newPassword.length < 6) {
            showMessage("Parola trebuie să aibă minim 6 caractere", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage("Parolele nu se potrivesc", "error");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: loginData.email,
                    code: resetCode,
                    newPassword: newPassword
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Eroare la setarea parolei");

            showMessage("Parolă resetată cu succes!", "success");

            setTimeout(() => {
                setActiveTab("login");
                setResetStep(1);
                setResetCode("");
                setNewPassword("");
                setConfirmPassword("");
                clearMessage();
            }, 2000);

        } catch (err) {
            showMessage(err.message, "error");
        }
    };

    return (
        <AuthPageView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loginData={loginData}
            registerData={registerData}
            setLoginData={setLoginData}
            setRegisterData={setRegisterData}
            message={message}
            clearMessage={clearMessage}
            handleLoginSubmit={handleLoginSubmit}
            handleRegisterSubmit={handleRegisterSubmit}
            handleResetSubmit={handleResetSubmit}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            resetStep={resetStep}
            setResetStep={setResetStep}
            resetCode={resetCode}
            setResetCode={setResetCode}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handleVerifyCode={handleVerifyCode}
            handleSetNewPassword={handleSetNewPassword}
        />
    );
}