import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyAccountPageView from "../views/MyAccountPageView";

const API_BASE_URL = "http://localhost:3002/api";

export default function MyAccountPage() {
    const navigate = useNavigate();

    // ====== STATE-URI CORECT DEFINITE ======
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);


    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState({ text: "", type: "" });

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

                setUser({
                    name: data.name,
                    email: data.email,
                    phone: data.phone || "",
                    address: data.address || "",
                });

            } catch (err) {
                setMessage({ text: err.message, type: "error" });
            }
        }

        async function loadOrders() {
            try {
                const res = await fetch(`${API_BASE_URL}/orders/mine`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();
                if (res.ok) setOrders(data);
            } catch (err) {
                console.error("Eroare comenzi:", err);
            }
        }

        (async () => {
            await loadUser();
            await loadOrders();
            setLoading(false);
        })();

    }, []);

    // ====== UPDATE PROFIL ======
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(`${API_BASE_URL}/account/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(user),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Eroare la actualizare");

            setMessage({ text: "Profil actualizat!", type: "success" });

        } catch (err) {
            setMessage({ text: err.message, type: "error" });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        // VALIDARE PAROLE
        if (newPassword.trim() === "" || confirmPassword.trim() === "") {
            setMessage({ text: "Te rugăm să completezi ambele câmpuri!", type: "error" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: "Parolele nu coincid!", type: "error" });
            return;
        }

        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(`${API_BASE_URL}/account/update`, {
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
        navigate("/login");
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
