import { Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./UserContext";

// Pagini existente
import AuthPage from "./pages/AuthPage";
import ShopPage from "./pages/ShopPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MyAccountPage from "./pages/MyAccountPage";
import CartPage from "./pages/CartPage";
import ProductDetailsPage from "./pages/ProductDetailsPage"; // ← NOU
import ReviewsManagement from "./pages/admin/ReviewsManagement";

// Pagini Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsManagement from "./pages/admin/ProductsManagement";

// Componentă pentru protejarea rutelor admin
function AdminRoute({ children }) {
    const { user, loading, isAdmin } = useUser();

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Se încarcă...</div>;
    }

    if (!user) {
        return <Navigate to="/" />;
    }

    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
}

// Componentă pentru protejarea rutelor autentificate
function ProtectedRoute({ children }) {
    const { user, loading } = useUser();

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Se încarcă...</div>;
    }

    if (!user) {
        return <Navigate to="/" />;
    }

    return children;
}

function AppRoutes() {
    const { user, logout, login } = useUser();

    return (
        <Routes>
            <Route
                path="/"
                element={
                    user ? (
                        <ShopPage onLogout={logout} />
                    ) : (
                        <AuthPage onLoginSuccess={login} />
                    )
                }
            />

            <Route
                path="/cart"
                element={
                    <ProtectedRoute>
                        <CartPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/my-account"
                element={
                    <ProtectedRoute>
                        <MyAccountPage />
                    </ProtectedRoute>
                }
            />

            {/* Rută pentru detalii produs - NU necesită autentificare */}
            <Route
                path="/product/:productId"
                element={<ProductDetailsPage />}
            />

            {/* Rute Admin */}
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/products"
                element={
                    <AdminRoute>
                        <ProductsManagement />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/reviews"
                element={
                    <AdminRoute>
                        <ReviewsManagement />
                    </AdminRoute>
                }
            />

            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default function App() {
    return (
        <UserProvider>
            <AppRoutes />
        </UserProvider>
    );
}