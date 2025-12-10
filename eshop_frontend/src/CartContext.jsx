import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Creăm Contextul
const CartContext = createContext();

// 2. Creăm Provider-ul (Componenta care "îmbracă" aplicația)
export const CartProvider = ({ children }) => {
    // Încercăm să luăm coșul din LocalStorage la început, ca să nu se piardă la refresh
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("shoppingCart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Salvăm în LocalStorage de fiecare dată când se schimbă coșul
    useEffect(() => {
        localStorage.setItem("shoppingCart", JSON.stringify(cartItems));
    }, [cartItems]);

    // FUNCȚIE: Adaugă în coș
    const addToCart = (product) => {
        setCartItems((prevItems) => {
            // Verificăm dacă produsul există deja
            const existingItem = prevItems.find((item) => item.id === product.id);

            if (existingItem) {
                // Dacă există, creștem cantitatea
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Dacă nu există, îl adăugăm cu cantitatea 1
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
        alert(`${product.title} a fost adăugat în coș!`);
    };

    // FUNCȚIE: Scoate din coș
    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    // FUNCȚIE: Modifică cantitatea (+/-)
    const updateQuantity = (productId, amount) => {
        setCartItems((prevItems) => {
            return prevItems.map((item) => {
                if (item.id === productId) {
                    const newQuantity = item.quantity + amount;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            });
        });
    };

    // FUNCȚIE: Golire coș (după comandă)
    const clearCart = () => {
        setCartItems([]);
    };

    // CALCUL TOTAL
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

// 3. Custom Hook pentru a folosi coșul ușor în alte fișiere
export const useCart = () => useContext(CartContext);