import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import "../pages/user/HomePage.css";
import { getCart } from "../services/cartService";

function Navbar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const email = sessionStorage.getItem("email");
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      document.getElementById("highlands-header")?.classList.toggle("scrolled", window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const refreshCart = () => getCart().then((res) => setCartCount((res.data || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0))).catch(() => setCartCount(0));
    const handleToast = (event) => {
      setToast(event.detail);
      window.setTimeout(() => setToast(null), 2600);
    };
    refreshCart();
    window.addEventListener("cart-updated", refreshCart);
    window.addEventListener("app-toast", handleToast);
    return () => { window.removeEventListener("cart-updated", refreshCart); window.removeEventListener("app-toast", handleToast); };
  }, []);

  const handleAccount = () => {
    if (token) navigate("/profile");
    else navigate("/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="highlands-home highlands-header-wrapper">
      <header id="highlands-header">
        <div className="header-container">
          <nav className="nav-left" aria-label="Điều hướng chính">
            <ul className="nav-menu">
              <li><Link to="/products">Thực Đơn</Link></li>
              <li><Link to="/vouchers">Khuyến Mãi</Link></li>
              <li><Link to="/about">Về Highlands</Link></li>
              <li><Link to="/news">Tin Tức</Link></li>
              <li><Link to="/support">Hỗ Trợ</Link></li>
            </ul>
          </nav>

          <div className="logo">
            <Link to="/">
              <img src="https://www.highlandscoffee.com.vn/vnt_upload/weblink/red_BG_logo800.png" alt="Highlands Coffee" />
            </Link>
          </div>

          <div className="nav-right">
            <ul className="nav-tools">
              <li><Link to="/cart" className="btn-delivery position-relative">Giỏ hàng{cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}</Link></li>
              <li>
                <button type="button" className="account-link" onClick={handleAccount}>
                  <i className="fa-solid fa-user"></i> {token ? email || "Tài khoản" : "Tài khoản"}
                </button>
              </li>
              {token && <li><button type="button" className="logout-link" onClick={handleLogout}>Đăng xuất</button></li>}
              <li className="lang"><img src="https://www.highlandscoffee.com.vn/vnt_upload/lang/flag-vn.jpg" alt="VN" /></li>
            </ul>
          </div>

          <div className="menu-toggle">
            <i className="fa-solid fa-bars"></i>
          </div>
        </div>
      </header>
      {toast && <div className={`app-toast ${toast.type === "error" ? "error" : ""}`}><i className={`fa-solid ${toast.type === "error" ? "fa-circle-xmark" : "fa-circle-check"}`}></i>{toast.message}</div>}
    </div>
  );
}

export default Navbar;
