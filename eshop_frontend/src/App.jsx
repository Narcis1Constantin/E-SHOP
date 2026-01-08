import { Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./UserContext";
import AuthPage from "./pages/AuthPage";
import ShopPage from "./pages/ShopPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MyAccountPage from "./pages/MyAccountPage";
import CartPage from "./pages/CartPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ReviewsManagement from "./pages/admin/ReviewsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import ReturnsManagement from "./pages/admin/ReturnsManagement";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ContactPage from "./pages/ContactPage.jsx"
// Pagini Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsManagement from "./pages/admin/ProductsManagement";
import FinancingManagement from "./pages/admin/FinancingManagement";

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

            <Route
                path="/admin/financing"
                element={
                    <AdminRoute>
                        <FinancingManagement />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/users"
                element={
                    <AdminRoute>
                        <UsersManagement />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/orders"
                element={
                    <AdminRoute>
                        <OrdersManagement />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/returns"
                element={
                    <AdminRoute>
                        <ReturnsManagement />
                    </AdminRoute>
                }
            />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/contact" element={<ContactPage />} />
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


