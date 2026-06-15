import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("email", username || form.username);

      alert("Đăng nhập thành công!");
      if (role === "ROLE_ADMIN" || role === "ROLE_STAFF") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        background: "linear-gradient(135deg, #fdf6ec 0%, #f5e6d3 50%, #fff 100%)",
      }}
    >
      <div className="container" style={{ maxWidth: "480px" }}>
        <div className="card shadow border-0 rounded-5 p-4 bg-white">
          <div className="text-center mb-4">
            <img
              src="https://www.highlandscoffee.com.vn/vnt_upload/weblink/red_BG_logo800.png"
              alt="Highlands Coffee"
              height="50"
              className="mb-3"
            />
            <h2 className="fw-extrabold text-danger mb-1" style={{ letterSpacing: "-1px" }}>
              ĐĂNG NHẬP
            </h2>
            <p className="text-muted mb-0">
              Đăng nhập để đặt cà phê, trà & bánh ngọt yêu thích
            </p>
            <small className="text-muted">Nhân viên & quản trị cũng đăng nhập tại đây</small>
          </div>

          {error && <div className="alert alert-danger rounded-3" role="alert">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Tên đăng nhập hoặc Email</label>
              <input
                name="username"
                type="text"
                className="form-control form-toy-control rounded-3"
                placeholder="Nhập tên đăng nhập hoặc email của bạn"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-dark">Mật khẩu</label>
              <input
                name="password"
                type="password"
                className="form-control form-toy-control rounded-3"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-toy-primary w-100 py-3 rounded-pill fw-bold text-white mb-3"
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "ĐĂNG NHẬP"}
            </button>
          </form>

          <div className="text-center">
            <p className="mb-0 text-muted">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-danger fw-bold text-decoration-none">
                Đăng ký thành viên
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
