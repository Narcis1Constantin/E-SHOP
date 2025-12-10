import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../AuthPage.css";
import ResetPasswordPageView from "../views/ResetPasswordPageView";

const API_BASE_URL = "http://localhost:3002/api";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            setMessage("Parolele nu coincid!");
            return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword: password })
        });

        const data = await res.json();

        if (!res.ok) {
            setMessage(data.error || "Eroare la server.");
            return;
        }

        setMessage("Parola a fost resetată cu succes! Poți intra în cont.");
    };

    return (
        <ResetPasswordPageView
            password={password}
            confirm={confirm}
            setPassword={setPassword}
            setConfirm={setConfirm}
            message={message}
            error={error}
            handleSubmit={handleSubmit}
        />
    );
}
