import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getPendingOrderCount } from "../services/orderService";
import { showToast } from "../services/shopConfigService";

function AdminSidebar() {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const fetchPendingCount = async () => {
      try {
        const res = await getPendingOrderCount();
        if (isMounted) {
          const count = res.data || 0;
          if (count > prevCountRef.current) {
            showToast("Có đơn hàng mới chờ duyệt!", "success");
          }
          prevCountRef.current = count;
          setPendingCount(count);
        }
      } catch (error) {
        console.error("Lỗi lấy số lượng đơn hàng:", error);
      }
    };

    fetchPendingCount(); // Lần đầu tiên chạy luôn
    const intervalId = setInterval(fetchPendingCount, 10000); // 10 giây 1 lần

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "fa-chart-pie" },
    { path: "/admin/products", label: "Quản lý sản phẩm", icon: "fa-mug-hot" },
    { path: "/admin/categories", label: "Quản lý danh mục", icon: "fa-layer-group" },
    { path: "/admin/orders", label: "Quản lý đơn hàng", icon: "fa-receipt" },
    { path: "/admin/news", label: "Quản lý tin tức", icon: "fa-newspaper" },
    { path: "/admin/banners", label: "Quản lý banner", icon: "fa-images" },
    { path: "/admin/complaints", label: "Tiếp nhận khiếu nại", icon: "fa-comments" },
    { path: "/admin/shipping", label: "Cửa hàng & giá cước", icon: "fa-truck-fast" },
    { path: "/admin/vouchers", label: "Quản lý voucher", icon: "fa-ticket" },
    { path: "/admin/users", label: "Quản lý người dùng", icon: "fa-users" },
  ];

  return (
    <div
      className="text-white p-3 d-flex flex-column h-100"
      style={{ minWidth: "260px", minHeight: "100vh", backgroundColor: "#3d2314" }}
    >
      <div className="mb-4 text-center">
        <img
          src="https://www.highlandscoffee.com.vn/vnt_upload/weblink/red_BG_logo800.png"
          alt="Highlands Coffee"
          height="40"
          className="mb-2"
        />
        <h5 className="fw-bold mb-0" style={{ color: "#f5e6d3" }}>Admin Panel</h5>
        <small className="text-white-50">Quản lý cửa hàng cafe & bánh ngọt</small>
      </div>
      <hr className="border-secondary" />
      <ul className="nav nav-pills flex-column mb-auto gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li className="nav-item" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link text-white d-flex align-items-center gap-2 rounded-3 py-2.5 px-3 ${
                  isActive ? "active fw-bold" : ""
                }`}
                style={{
                  transition: "all 0.2s",
                  backgroundColor: isActive ? "#e30613" : "transparent",
                }}
              >
                <i className={`fa-solid ${item.icon}`} style={{ opacity: 0.8 }}></i>
                {item.label}
                {item.path === "/admin/orders" && pendingCount > 0 && (
                  <span className="badge bg-warning text-dark ms-auto rounded-pill px-2">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <hr className="border-secondary" />
      <Link
        to="/"
        className="btn w-100 py-2 rounded-3 fw-bold text-white"
        style={{ backgroundColor: "#d4a574", border: "none" }}
      >
        <i className="fa-solid fa-house me-1"></i> Về Trang Chủ
      </Link>
    </div>
  );
}

export default AdminSidebar;
