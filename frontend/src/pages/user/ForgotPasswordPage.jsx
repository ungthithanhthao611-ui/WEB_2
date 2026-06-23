import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../../services/authService";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccessMessage(res.data || "Mã OTP đã được gửi đến email của bạn.");
      setStep(2);
    } catch (err) {
      const errorData = err.response?.data;
      if (typeof errorData === 'string') {
        setError(errorData);
      } else if (errorData && errorData.message) {
        setError(errorData.message);
      } else if (errorData && errorData.error) {
        setError(`Lỗi: ${errorData.error}`);
      } else {
        setError("Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await resetPassword(email, otp, newPassword);
      setSuccessMessage(res.data || "Mật khẩu đã được cập nhật thành công.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorData = err.response?.data;
      if (typeof errorData === 'string') {
        setError(errorData);
      } else if (errorData && errorData.message) {
        setError(errorData.message);
      } else if (errorData && errorData.error) {
        setError(`Lỗi: ${errorData.error}`);
      } else {
        setError("Xác nhận OTP thất bại. Vui lòng kiểm tra lại.");
      }
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
                    "url('https://www.highlandscoffee.com.vn/vnt_upload/news/03_2024/7_Loi_Ich_Cua_Ca_Phe_Highlands_Coffee_5.jpg')",
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
                <h3 className="fw-bold mb-3">Tìm Lại Mật Khẩu</h3>
                <p className="mb-0 text-light" style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                  Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập để tiếp tục trải nghiệm hương vị Highlands Coffee.
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
                    QUÊN MẬT KHẨU
                  </h3>
                  <p className="text-muted mb-0">
                    {step === 1
                      ? "Nhập email của bạn để nhận mã khôi phục"
                      : "Nhập mã OTP và mật khẩu mới"}
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger rounded-3 border-0 bg-danger text-white shadow-sm" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>{error}
                  </div>
                )}
                {successMessage && (
                  <div className="alert alert-success rounded-3 border-0 bg-success text-white shadow-sm" role="alert">
                    <i className="fas fa-check-circle me-2"></i>{successMessage}
                  </div>
                )}

                {step === 1 ? (
                  <form onSubmit={handleRequestOtp}>
                    <div className="form-floating mb-4">
                      <input
                        type="email"
                        className="form-control rounded-3"
                        id="floatingEmail"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <label htmlFor="floatingEmail" className="text-muted"><i className="fas fa-envelope me-2"></i>Email đăng ký</label>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-3 rounded-pill fw-bold text-white mb-4 shadow-sm"
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
                        <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang gửi...</span>
                      ) : (
                        "GỬI MÃ KHÔI PHỤC"
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control rounded-3"
                        id="floatingOtp"
                        placeholder="Nhập mã 6 số"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        style={{ letterSpacing: "3px", textAlign: "center", fontSize: "1.2rem", fontWeight: "bold" }}
                      />
                      <label htmlFor="floatingOtp" className="text-muted"><i className="fas fa-key me-2"></i>Mã OTP (6 số)</label>
                    </div>

                    <div className="form-floating mb-4">
                      <input
                        type="password"
                        className="form-control rounded-3"
                        id="floatingPassword"
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <label htmlFor="floatingPassword" className="text-muted"><i className="fas fa-lock me-2"></i>Mật khẩu mới</label>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-3 rounded-pill fw-bold text-white mb-4 shadow-sm"
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
                        <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý...</span>
                      ) : (
                        "XÁC NHẬN ĐỔI MẬT KHẨU"
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center">
                  <p className="mb-0 text-muted">
                    <i className="fas fa-arrow-left me-1"></i> Quay lại trang{" "}
                    <Link to="/login" className="text-danger fw-bold text-decoration-none" style={{ transition: "color 0.2s ease" }}>
                      Đăng nhập
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

export default ForgotPasswordPage;
