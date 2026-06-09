import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== "ROLE_ADMIN" && role !== "ROLE_STAFF") {
    alert("Bạn không có quyền truy cập trang quản trị!");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
