import { Link, useLocation } from "react-router-dom";

function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "fa-chart-pie" },
    { path: "/admin/products", label: "Quản lý sản phẩm", icon: "fa-box-open" },
    { path: "/admin/categories", label: "Quản lý danh mục", icon: "fa-folder-open" },
    { path: "/admin/orders", label: "Quản lý đơn hàng", icon: "fa-receipt" },
    { path: "/admin/users", label: "Quản lý người dùng", icon: "fa-users" },
  ];

  return (
    <div className="bg-dark text-white p-3 d-flex flex-column h-100" style={{ minWidth: "250px", minHeight: "100vh" }}>
      <div className="mb-4 text-center">
        <h4 className="fw-bold text-warning mb-1">Admin Panel</h4>
        <small className="text-white-50">E-Commerce Management</small>
      </div>
      <hr className="bg-secondary" />
      <ul className="nav nav-pills flex-column mb-auto gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li className="nav-item" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link text-white d-flex align-items-center gap-2 rounded-3 py-2.5 px-3 ${isActive ? 'bg-primary active fw-bold' : ''}`}
                style={{ transition: "all 0.2s" }}
              >
                <i className={`fa-solid ${item.icon} text-white-50`}></i>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <hr className="bg-secondary" />
      <Link to="/" className="btn btn-outline-warning w-100 py-2 rounded-3 fw-bold">
        <i className="fa-solid fa-house me-1"></i> Về Trang Chủ
      </Link>
    </div>
  );
}

export default AdminSidebar;
