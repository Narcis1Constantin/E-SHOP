import { useState } from 'react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';

/**
 * SHOP FACADE (Frontend) - VERSIUNEA CU STRIPE
 * Ascunde complexitatea de:
 * 1. State Management (Context)
 * 2. API Calls (Fetch)
 * 3. Routing (Navigate)
 * 4. Validation
 * 5. Payment Processing (Stripe)
 */
export const useShopFacade = () => {
    const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    // Sub-sistem: API Caller (intern) - ACTUALIZAT PENTRU STRIPE
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

    // 2. Interfață simplificată pentru Checkout - VERSIUNEA CU STRIPE
    const processCheckout = async (userData, deliveryMethod, selectedLocker, paymentMethod) => {
        // A. Validare (Ascunsă de UI)
        if (!userData.email) throw new Error("Email obligatoriu!");

        if (deliveryMethod === "home") {
            if (!userData.nume) throw new Error("Nume obligatoriu!");
            if (!userData.telefon) throw new Error("Telefon obligatoriu!");
            if (!userData.adresa) throw new Error("Adresă lipsă!");
        }

        if (deliveryMethod === "easybox" && !selectedLocker) {
            throw new Error("Alege un Easybox!");
        }

        if (cartItems.length === 0) {
            throw new Error("Coșul este gol!");
        }

        setIsProcessing(true);

        try {
            // B. Pregătire date
            const finalAddress = deliveryMethod === "home"
                ? `${userData.adresa}, ${userData.oras}, ${userData.judet}`
                : selectedLocker.name;

            const payload = {
                address: finalAddress,
                email: userData.email,
                paymentMethod: paymentMethod, // 'card' sau 'ramburs'
                items: cartItems
            };

            console.log('📦 Trimitere comandă:', payload);

            // C. Apel API
            const result = await _sendOrderToApi(payload);

            console.log('✅ Răspuns server:', result);

            // D. PROCESARE RĂSPUNS ÎN FUNCȚIE DE METODĂ
            if (result.paymentUrl) {
                // === PLATĂ CU CARD - REDIRECT LA STRIPE ===
                console.log('💳 Redirect la Stripe Checkout...');
                clearCart(); // Golim coșul înainte de redirect
                window.location.href = result.paymentUrl; // Redirect către Stripe
            } else {
                // === PLATĂ RAMBURS - CONFIRMARE LOCALĂ ===
                clearCart();
                alert(`✅ Succes! Comanda #${result.orderId} a fost plasată.\n\nVei plăti la livrare (ramburs).\nVei primi un email de confirmare.`);
                navigate("/");
            }

        } catch (err) {
            console.error('❌ Eroare checkout:', err);
            alert(`❌ Eroare: ${err.message}`);
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    // 3. Verificare status plată (după redirect de la Stripe)
    const checkPaymentStatus = async (sessionId) => {
        try {
            const response = await fetch(`http://localhost:3002/api/stripe/payment-status/${sessionId}`);
            const result = await response.json();
            return result;
        } catch (err) {
            console.error('Eroare verificare plată:', err);
            return null;
        }
    };

    // Expunem doar ce are nevoie Componenta React
    return {
        cartItems,
        cartTotal,
        addProductToCart,      // Facade method
        processCheckout,       // Facade method (cu Stripe)
        checkPaymentStatus,    // Facade method (nou - pentru success page)
        isProcessing,
        // Metode helper dacă sunt necesare în UI pentru modificări fine
        updateQuantity,
        removeFromCart
    };
};