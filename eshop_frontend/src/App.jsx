import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Importăm paginile din folderul PAGES
import AuthPage from "./pages/AuthPage";
import ShopPage from "./pages/ShopPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MyAccountPage from "./pages/MyAccountPage";

// CartPage a rămas în root src (conform imaginii tale)
import CartPage from "./pages/CartPage";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("authToken"));

    const handleLoginSuccess = () => setIsLoggedIn(true);
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
    };

    return (
        <Routes>
            <Route path="/" element={isLoggedIn ? <ShopPage onLogout={handleLogout} /> : <AuthPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/cart" element={isLoggedIn ? <CartPage /> : <Navigate to="/" />} />
            <Route path="/my-account" element={isLoggedIn ? <MyAccountPage /> : <Navigate to="/" />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}