import React, { useState } from "react";
import "../AuthPage.css";
import AuthPageView from "../views/AuthPageView";

const API_BASE_URL = "http://localhost:3002/api";

// 1. Aici am adaugat prop-ul { onLoginSuccess }
export default function AuthPage({ onLoginSuccess }) {
    const [activeTab, setActiveTab] = useState("login"); // "login" sau "register"

    // state pentru formulare
    const [loginData, setLoginData] = useState({
        email: "client@test.com",
        password: "parola123",
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
        type: "", // "success" | "error" | ""
    });

    const showMessage = (text, type = "") => {
        setMessage({ text, type });
    };

    const clearMessage = () => {
        setMessage({ text: "", type: "" });
    };

    const apiCall = async (url, bodyData) => {
        showMessage("Se trimite cererea...", "");

        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            const result = await response.json();

            await delay(500);
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

                //salvez datele userului pentru a le folosi la my account
                if (result.user) {
                    localStorage.setItem("userName", result.user.name);
                    localStorage.setItem("userEmail", result.user.email);
                } else {
                    // fallback dacă backendul nu trimite user
                    localStorage.setItem("userName", "Client E-Shop");
                    localStorage.setItem("userEmail", bodyData.email);
                }
            }

            // afisam doar "Succes!"
            showMessage("Succes!", "success");

            // La register, trecem pe tab login si completam email + parola
            if (url.includes("register")) {
                setActiveTab("login");
                setLoginData({
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


    /// SUBMIT REGISTER
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const data = { ...registerData };
        await apiCall(`${API_BASE_URL}/auth/register`, data);
    };

    /// SUBMIT LOGIN
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const data = { ...loginData };

        // Dacă userul a ales email - trimitem DOAR email
        if (data.type === "email") {
            delete data.phone;
        }

        // Dacă userul a ales telefon - trimitem DOAR telefon
        if (data.type === "phone") {
            delete data.email;
        }
        const success = await apiCall(`${API_BASE_URL}/auth/login`, data);

        // 2. Aici am modificat logica de succes
        if (success) {
            setTimeout(() => {
                // Nu mai facem redirect cu window.location
                // Apelam functia primita din App.jsx pentru a schimba starea
                onLoginSuccess();
            }, 500);
        }
    };
    // SUBMIT REGISTER PASSWORD
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

            showMessage("Dacă emailul există, vei primi instrucțiuni.", "success");
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
        />
    );
}