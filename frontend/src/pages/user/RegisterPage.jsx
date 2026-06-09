import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/authService";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu nhập lại không trùng khớp!");
      return;
    }

    setLoading(true);

    try {
      await register(form);
      alert("Đăng ký tài khoản thành công! Phụ huynh có thể đăng nhập ngay.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Đăng ký thất bại. Tên đăng nhập hoặc Email có thể đã tồn tại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "550px" }}>
      <div className="card shadow-sm border-0 rounded-5 p-4 bg-white text-left">
        <div className="text-center mb-4">
          <h2 className="fw-extrabold text-danger mb-1" style={{ letterSpacing: "-1px" }}>ĐĂNG KÝ PHỤ HUYNH</h2>
          <p className="text-muted">Đăng ký thành viên nhận quà tặng sinh nhật đặc biệt cho bé</p>
        </div>

        {error && <div className="alert alert-danger rounded-3" role="alert">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label fw-bold text-dark">Họ tên phụ huynh</label>
            <input
              name="fullName"
              type="text"
              className="form-control form-toy-control rounded-3"
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold text-dark">Tên đăng nhập</label>
            <input
              name="username"
              type="text"
              className="form-control form-toy-control rounded-3"
              placeholder="username123"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold text-dark">Email phụ huynh</label>
            <input
              name="email"
              type="email"
              className="form-control form-toy-control rounded-3"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
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

            <div className="col-md-6 mb-4">
              <label className="form-label fw-bold text-dark">Nhập lại mật khẩu</label>
              <input
                name="confirmPassword"
                type="password"
                className="form-control form-toy-control rounded-3"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-toy-primary w-100 py-3 rounded-pill fw-bold text-white mb-3"
            disabled={loading}
          >
            {loading ? "Đang tạo tài khoản..." : "ĐĂNG KÝ THÀNH VIÊN"}
          </button>
        </form>

        <div className="text-center">
          <p className="mb-0 text-muted">
            Đã có tài khoản phụ huynh? <Link to="/login" className="text-danger fw-bold text-decoration-none">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
