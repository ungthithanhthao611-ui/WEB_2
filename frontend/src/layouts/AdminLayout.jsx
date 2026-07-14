import AdminSidebar from "../components/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex vh-100 overflow-hidden" style={{ backgroundColor: "#fdf6ec" }}>
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ overflowY: "auto", height: "100vh" }}>
        <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom bg-white rounded-4 px-4 py-3 shadow-sm">
          <h4 className="fw-bold text-dark mb-0">Hệ thống quản trị</h4>
          <div className="d-flex align-items-center gap-3">
            <span
              className="badge px-3 py-2 fs-6 text-white"
              style={{ backgroundColor: "#e30613" }}
            >
              Đã xác thực Admin
            </span>
            <button 
              className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
              onClick={handleLogout}
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              Đăng xuất
            </button>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
