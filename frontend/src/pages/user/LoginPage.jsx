import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../services/shopConfigService";
import { login } from "../../services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form);
      const { token, role, userId, username } = res.data;

      // Chuẩn hóa role: đảm bảo có tiền tố ROLE_ và in hoa
      let normalizedRole = role ? (role.toUpperCase().startsWith("ROLE_") ? role.toUpperCase() : `ROLE_${role.toUpperCase()}`) : "ROLE_USER";

      // Fallback cho trường hợp database chưa set đúng role (trả về ROLE_USER mặc định)
      const loginName = (username || form.username).toLowerCase();
      if (normalizedRole === "ROLE_USER") {
        if (loginName.includes("shipper")) {
          normalizedRole = "ROLE_SHIPPER";
        } else if (loginName.includes("staff") || loginName.includes("nhanvien")) {
          normalizedRole = "ROLE_STAFF";
        } else if (loginName.includes("admin") || loginName.includes("quantri")) {
          normalizedRole = "ROLE_ADMIN";
        }
      }

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", normalizedRole);
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("email", username || form.username);

      showToast("Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => {
        if (normalizedRole === "ROLE_ADMIN") {
          window.location.href = "/admin";
        } else if (normalizedRole === "ROLE_STAFF") {
          window.location.href = "/staff";
        } else if (normalizedRole === "ROLE_SHIPPER") {
          window.location.href = "/shipper";
        } else {
          window.location.href = "/";
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "#f8f9fa",
      }}
    >
      <div className="container" style={{ maxWidth: "1000px" }}>
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white">
          <div className="row g-0">
            {/* Left Image Section */}
            <div className="col-md-6 d-none d-md-block position-relative">
              <div
                style={{
                  backgroundImage:
                    "url('https://www.highlandscoffee.com.vn/vnt_upload/weblink/HCO-7605-FESTIVE-2020-WEB-FB-2000X639_1.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "100%",
                  minHeight: "500px",
                }}
              ></div>
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: "linear-gradient(to bottom, rgba(178,40,48,0.7), rgba(0,0,0,0.8))",
                }}
              ></div>
              <div className="position-absolute bottom-0 start-0 p-5 text-white">
                <h3 className="fw-bold mb-3">Chào mừng trở lại!</h3>
                <p className="mb-0 text-light" style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                  Đăng nhập để đặt ngay những ly cà phê đậm đà và những phần bánh ngọt hấp dẫn từ Highlands Coffee.
                </p>
              </div>
            </div>

            {/* Right Form Section */}
            <div className="col-md-6 d-flex align-items-center">
              <div className="p-5 w-100">
                <div className="text-center mb-5">
                  <img
                    src="https://www.highlandscoffee.com.vn/vnt_upload/weblink/red_BG_logo800.png"
                    alt="Highlands Coffee"
                    height="60"
                    className="mb-4"
                    style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}
                  />
                  <h3 className="fw-extrabold text-danger mb-2" style={{ letterSpacing: "-0.5px" }}>
                    ĐĂNG NHẬP
                  </h3>
                  <p className="text-muted mb-0">Hệ thống thành viên & nhân viên</p>
                </div>

                {error && (
                  <div className="alert alert-danger rounded-3 border-0 bg-danger text-white shadow-sm" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>{error}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="form-floating mb-3">
                    <input
                      name="username"
                      type="text"
                      className="form-control rounded-3"
                      id="floatingUsername"
                      placeholder="Nhập tên đăng nhập hoặc email"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="floatingUsername" className="text-muted"><i className="fas fa-user me-2"></i>Tên đăng nhập / Email</label>
                  </div>

                  <div className="form-floating mb-4">
                    <input
                      name="password"
                      type="password"
                      className="form-control rounded-3"
                      id="floatingPassword"
                      placeholder="Mật khẩu"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="floatingPassword" className="text-muted"><i className="fas fa-lock me-2"></i>Mật khẩu</label>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-3 rounded-pill fw-bold text-white mb-3 shadow-sm"
                    style={{
                      background: "linear-gradient(45deg, #b22830, #d93841)",
                      border: "none",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    disabled={loading}
                  >
                    {loading ? (
                      <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xác thực...</span>
                    ) : (
                      "ĐĂNG NHẬP"
                    )}
                  </button>
                </form>

                <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="rememberMe" />
                    <label className="form-check-label text-muted small" htmlFor="rememberMe">
                      Nhớ tài khoản
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-danger small text-decoration-none fw-semibold">
                    Quên mật khẩu?
                  </Link>
                </div>

                <div className="text-center mt-2 border-top pt-4">
                  <p className="mb-0 text-muted small">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="text-danger fw-bold text-decoration-none">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
