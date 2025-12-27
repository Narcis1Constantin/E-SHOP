// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './CartContext.jsx'
import { UserProvider } from './UserContext.jsx'

// --- IMPORT PENTRU HARTĂ ---
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <UserProvider>
                <CartProvider>
                    <App />
                </CartProvider>
            </UserProvider>
        </BrowserRouter>
    </StrictMode>
)