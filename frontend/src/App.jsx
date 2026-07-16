import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// User Pages
import HomePage from "./pages/user/HomePage";
import ProductListPage from "./pages/user/ProductListPage";
import ProductDetailPage from "./pages/user/ProductDetailPage";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import VnpayResultPage from "./pages/user/VnpayResultPage";
import LoginPage from "./pages/user/LoginPage";
import RegisterPage from "./pages/user/RegisterPage";
import ForgotPasswordPage from "./pages/user/ForgotPasswordPage";
import OrderHistoryPage from "./pages/user/OrderHistoryPage";
import ProfilePage from "./pages/user/ProfilePage";
import WishlistPage from "./pages/user/WishlistPage";
import NotificationPage from "./pages/user/NotificationPage";
import NewsPage from "./pages/user/NewsPage";
import NewsDetailPage from "./pages/user/NewsDetailPage";
import VoucherPage from "./pages/user/VoucherPage";
import AboutPage from "./pages/user/AboutPage";
import SupportPage from "./pages/user/SupportPage";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import AdminProductPage from "./pages/admin/AdminProductPage";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage";
import AdminOrderPage from "./pages/admin/AdminOrderPage";
import AdminUserPage from "./pages/admin/AdminUserPage";
import AdminNewsPage from "./pages/admin/AdminNewsPage";
import AdminComplaintPage from "./pages/admin/AdminComplaintPage";
import AdminShippingPage from "./pages/admin/AdminShippingPage";
import AdminVoucherPage from "./pages/admin/AdminVoucherPage";
import AdminBannerPage from "./pages/admin/AdminBannerPage";
import AdminSupportPage from "./pages/admin/AdminSupportPage";

// Security
import ProtectedRoute from "./components/ProtectedRoute";

// Staff & Shipper Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import ShipperDashboard from "./pages/shipper/ShipperDashboard";

function App() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleToast = (event) => {
      setToast(event.detail);
      window.setTimeout(() => setToast(null), 2600);
    };
    window.addEventListener("app-toast", handleToast);
    return () => window.removeEventListener("app-toast", handleToast);
  }, []);

  return (
    <>
      {toast && (
        <div className={`app-toast ${toast.type === "error" ? "error" : ""}`} style={{ zIndex: 9999 }}>
          <i className={`fa-solid ${toast.type === "error" ? "fa-circle-xmark" : "fa-circle-check"}`}></i>
          {toast.message}
        </div>
      )}
      <BrowserRouter>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/vouchers" element={<VoucherPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* User Protected Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/vnpay-result"
          element={
            <ProtectedRoute>
              <VnpayResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/news"
          element={<ProtectedRoute adminOnly={true}><AdminNewsPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/complaints"
          element={<ProtectedRoute adminOnly={true}><AdminComplaintPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/shipping"
          element={<ProtectedRoute adminOnly={true}><AdminShippingPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/vouchers"
          element={<ProtectedRoute adminOnly={true}><AdminVoucherPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/banners"
          element={<ProtectedRoute adminOnly={true}><AdminBannerPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/support"
          element={<ProtectedRoute adminOnly={true}><AdminSupportPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminUserPage />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredRole="ROLE_STAFF">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shipper Routes */}
        <Route
          path="/shipper"
          element={
            <ProtectedRoute requiredRole="ROLE_SHIPPER">
              <ShipperDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
