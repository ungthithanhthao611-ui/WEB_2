import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

function Navbar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const email = sessionStorage.getItem("email");

  const handleLogout = () => {
    logout();
    alert("Đã đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <header className="sticky-top shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-danger text-white py-1.5 px-3" style={{ fontSize: "0.85rem", backgroundColor: "#e30613" }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-4">
            <span><i className="fa-solid fa-phone me-1"></i> Hotline: 1900 1208</span>
            <span><i className="fa-solid fa-location-dot me-1"></i> Hệ thống 150+ Cửa hàng toàn quốc</span>
          </div>
          <div className="d-flex gap-3">
            <span>Đồ chơi an toàn - Phát triển trí tuệ</span>
          </div>
        </div>
      </div>

      {/* Main Brand Header */}
      <div className="bg-white py-3 border-bottom">
        <div className="container d-flex justify-content-between align-items-center gap-3">
          {/* Logo MyKingdom style */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <span className="fw-extrabold fs-2 text-danger" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-1px" }}>
              MY<span className="text-warning bg-danger px-2 py-0.5 rounded-4 ms-1">KINGDOM</span>
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-grow-1 mx-lg-5 position-relative" style={{ maxWidth: "600px" }}>
            <input
              type="text"
              className="form-control rounded-pill py-2.5 px-4 bg-light border-0"
              placeholder="Tìm kiếm đồ chơi thông minh, LEGO, Búp bê..."
              style={{ paddingRight: "50px" }}
            />
            <button className="btn position-absolute top-50 end-0 translate-middle-y me-2 text-danger">
              <i className="fa-solid fa-magnifying-glass fs-5"></i>
            </button>
          </div>

          {/* User Controls */}
          <div className="d-flex align-items-center gap-3">
            {token ? (
              <div className="dropdown">
                <button className="btn btn-light rounded-pill dropdown-toggle px-3 py-2 fw-semibold text-dark border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="fa-solid fa-circle-user text-danger me-1 fs-5"></i> {email}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 p-2 mt-2">
                  {(role === "ROLE_ADMIN" || role === "ROLE_STAFF") && (
                    <li>
                      <Link to="/admin" className="dropdown-item rounded-3 py-2 fw-semibold text-danger">
                        <i className="fa-solid fa-user-shield me-2"></i> Admin Panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/profile" className="dropdown-item rounded-3 py-2 fw-semibold">
                      <i className="fa-solid fa-user-gear me-2 text-muted"></i> Thông tin tài khoản
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="dropdown-item rounded-3 py-2 fw-semibold">
                      <i className="fa-solid fa-receipt me-2 text-muted"></i> Đơn hàng của tôi
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item rounded-3 py-2 fw-semibold text-danger" onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold" style={{ borderWidth: "2px" }}>
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-danger rounded-pill px-4 py-2 fw-bold text-white">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Cart Icon */}
            {token && (
              <Link to="/cart" className="btn btn-danger rounded-circle p-2.5 position-relative text-white shadow-sm" style={{ width: "45px", height: "45px" }}>
                <i className="fa-solid fa-basket-shopping fs-5"></i>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger py-2" style={{ backgroundColor: "#e30613" }}>
        <div className="container">
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold px-3 py-2 rounded-3 active" to="/">TRANG CHỦ</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold px-3 py-2 rounded-3" to="/products">LEGO lắp ráp</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold px-3 py-2 rounded-3" to="/products">Đồ chơi bé trai</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold px-3 py-2 rounded-3" to="/products">Đồ chơi bé gái</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold px-3 py-2 rounded-3 text-warning animate-pulse" to="/products">KHUYẾN MÃI HOT 🔥</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
