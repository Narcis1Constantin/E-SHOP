import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import MyAccountPageView from "../views/MyAccountPageView";

const API_BASE_URL = "http://localhost:3002/api";

export default function MyAccountPage() {
    const navigate = useNavigate();
    const { logout } = useUser();

    // ====== STATE-URI CORECT DEFINITE ======
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        points: 0,          // ✅ ADĂUGAT
        total_spent: 0      // ✅ ADĂUGAT
    });

    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState({ text: "", type: "" });

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // ====== AUTO-DISMISS MESSAGE DUPA 2 SECUNDE ======
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 2000); // 2 secunde

            // Cleanup timer dacă se schimbă mesajul înainte
            return () => clearTimeout(timer);
        }
    }, [message]);

    // ====== FETCH USER + ORDERS ======
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/login");
            return;
        }

        async function loadUser() {
            try {
                const res = await fetch(`${API_BASE_URL}/account/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Eroare server");

                // ✅ FIX: Salvează TOATE datele user-ului, inclusiv points și total_spent
                setUser({
                    name: data.user.name || "",
                    email: data.user.email || "",
                    phone: data.user.phone || "",
                    address: data.user.address || "",
                    points: data.user.points || 0,           // ✅ ADĂUGAT
                    total_spent: data.user.total_spent || 0  // ✅ ADĂUGAT
                });

                console.log('✅ User loaded with points:', data.user.points); // Debug

            } catch (err) {
                setMessage({ text: err.message, type: "error" });
            }
        }

        async function loadOrders() {
            try {
                console.log('Loading orders from:', `${API_BASE_URL}/orders/mine`);
                const res = await fetch(`${API_BASE_URL}/orders/mine`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Orders response status:', res.status);
                const data = await res.json();
                console.log('Orders data received:', data);

                if (res.ok) {
                    setOrders(data);
                    console.log('Orders set to state:', data);
                } else {
                    console.error('Orders response not ok:', data);
                }
            } catch (err) {
                console.error("Eroare comenzi:", err);
            }
        }

        (async () => {
            await loadUser();
            await loadOrders();
            setLoading(false);
        })();

    }, [navigate]);

    // ====== VALIDARE PROFIL ======
    const validateProfile = () => {
        // Validare nume complet (minim 2 cuvinte)
        const nameParts = user.name.trim().split(/\s+/);
        if (nameParts.length < 2) {
            setMessage({
                text: "Te rugăm să introduci numele complet (prenume și nume)!",
                type: "error"
            });
            return false;
        }

        // Validare email (trebuie să conțină @)
        if (!user.email.includes("@")) {
            setMessage({
                text: "Adresa de email trebuie să conțină @!",
                type: "error"
            });
            return false;
        }

        // Validare email format complet
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            setMessage({
                text: "Adresa de email nu este validă!",
                type: "error"
            });
            return false;
        }

        // Validare telefon (minim 10 caractere)
        const phoneDigits = user.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setMessage({
                text: "Numărul de telefon trebuie să conțină minim 10 cifre!",
                type: "error"
            });
            return false;
        }

        // Validare adresă (minim 10 caractere)
        if (user.address.trim().length < 10) {
            setMessage({
                text: "Adresa trebuie să conțină minim 10 caractere!",
                type: "error"
            });
            return false;
        }

        return true;
    };

    // ====== UPDATE PROFIL ======
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        // Validare înainte de trimitere
        if (!validateProfile()) {
            return;
        }

        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(`${API_BASE_URL}/account/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: user.name,
                    phone: user.phone,
                    address: user.address
                    // ⚠️ NU trimitem points/total_spent - acestea se calculează în backend
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Eroare la actualizare");

            setMessage({ text: "Profil actualizat cu succes!", type: "success" });

            // ✅ Re-încarcă datele user-ului pentru a actualiza points dacă s-au schimbat
            const userRes = await fetch(`${API_BASE_URL}/account/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = await userRes.json();
            if (userRes.ok) {
                setUser(prev => ({
                    ...prev,
                    points: userData.user.points || 0,
                    total_spent: userData.user.total_spent || 0
                }));
            }

        } catch (err) {
            setMessage({ text: err.message, type: "error" });
        }
    };

    // ====== SCHIMBARE PAROLA ======
    const handleChangePassword = async (e) => {
        e.preventDefault();

        // VALIDARE PAROLE
        if (newPassword.trim() === "" || confirmPassword.trim() === "") {
            setMessage({ text: "Te rugăm să completezi ambele câmpuri!", type: "error" });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ text: "Parola trebuie să conțină minim 6 caractere!", type: "error" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: "Parolele nu coincid!", type: "error" });
            return;
        }

        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(`${API_BASE_URL}/account/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password: newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Eroare la actualizarea parolei");
            }

            // SUCCES
            setMessage({
                text: data.message || "Parola a fost schimbată cu succes!",
                type: "success",
            });

            setNewPassword("");
            setConfirmPassword("");

        } catch (err) {
            setMessage({ text: err.message, type: "error" });
        }
    };

    // ====== LOGOUT ======
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        logout(); // Apelăm logout din UserContext
        navigate("/", { replace: true });
    };

    return (
        <MyAccountPageView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={loading}
            user={user}
            setUser={setUser}
            orders={orders}
            message={message}
            handleUpdateSubmit={handleUpdateSubmit}
            handleLogout={handleLogout}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            handleChangePassword={handleChangePassword}
        />
    );
}