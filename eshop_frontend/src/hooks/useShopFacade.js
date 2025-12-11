import { useState } from 'react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';

/**
 * SHOP FACADE (Frontend)
 * Ascunde complexitatea de:
 * 1. State Management (Context)
 * 2. API Calls (Fetch)
 * 3. Routing (Navigate)
 * 4. Validation
 */
export const useShopFacade = () => {
    const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    // Sub-sistem: API Caller (intern)
    const _sendOrderToApi = async (orderPayload) => {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:3002/api/orders/place", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(orderPayload)
        });

        const res = await response.json();
        if (!response.ok) throw new Error(res.error || "Eroare server");
        return res;
    };

    // === INTERFAȚA PUBLICĂ A FACADE-ULUI ===

    // 1. Interfață simplificată pentru adăugare produs
    const addProductToCart = (product) => {
        // Putem adăuga logică extra aici (ex: analytics, toast custom)
        addToCart(product);
    };

    // 2. Interfață simplificată pentru Checkout
    const processCheckout = async (userData, deliveryMethod, selectedLocker, paymentMethod) => {
        // A. Validare (Ascunsă de UI)
        if (!userData.email) throw new Error("Email obligatoriu!");
        if (deliveryMethod === "home" && !userData.adresa) throw new Error("Adresă lipsă!");
        if (deliveryMethod === "easybox" && (!selectedLocker || selectedLocker.name.includes("Se caută"))) {
            throw new Error("Alege Easybox!");
        }

        setIsProcessing(true);
        try {
            // B. Pregătire date
            const finalAddress = deliveryMethod === "home"
                ? `${userData.adresa}, ${userData.oras}`
                : selectedLocker.name;

            const payload = {
                address: finalAddress,
                email: userData.email,
                paymentMethod,
                items: cartItems
            };

            // C. Apel API
            const result = await _sendOrderToApi(payload);

            // D. Curățare și Navigare
            clearCart();
            alert(`Succes! Comanda #${result.orderId} a fost plasată.`);
            navigate("/");

        } catch (err) {
            alert(`Eroare: ${err.message}`);
            throw err; // Aruncăm mai departe dacă UI-ul vrea să știe
        } finally {
            setIsProcessing(false);
        }
    };

    // Expunem doar ce are nevoie Componenta React
    return {
        cartItems,
        cartTotal,
        addProductToCart,   // Facade method
        processCheckout,    // Facade method
        isProcessing,
        // Metode helper dacă sunt necesare in UI pentru modificări fine
        updateQuantity,
        removeFromCart
    };
};