import { useState } from 'react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';


export const useShopFacade = () => {
    const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

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

    const addProductToCart = (product) => {
        addToCart(product);
    };
    const processCheckout = async (userData, deliveryMethod, selectedLocker, paymentMethod) => {
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

            const result = await _sendOrderToApi(payload);

            console.log('✅ Răspuns server:', result);

            if (result.paymentUrl) {
                console.log('💳 Redirect la Stripe Checkout...');
                clearCart();
                window.location.href = result.paymentUrl;
            } else {
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

    return {
        cartItems,
        cartTotal,
        addProductToCart,
        processCheckout,
        checkPaymentStatus,
        isProcessing,
        updateQuantity,
        removeFromCart
    };
};