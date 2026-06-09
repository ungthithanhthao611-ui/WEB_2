import { useEffect, useState } from "react";
import { getUserProfile } from "../../services/authService";
import UserLayout from "../../layouts/UserLayout";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await getUserProfile(userId);
      setProfile(res.data);
    } catch (err) {
      console.error("Lỗi lấy thông tin tài khoản:", err);
      setError("Không thể tải thông tin tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <UserLayout>
      <div className="container mt-4" style={{ maxWidth: "600px" }}>
        <div className="card shadow-sm border-0 rounded-5 p-4 bg-white">
          <div className="text-center mb-4">
            <h3 className="fw-extrabold text-danger mb-1">THÔNG TIN TÀI KHOẢN</h3>
            <p className="text-muted">Thông tin tài khoản phụ huynh trên hệ thống MyKingdom</p>
          </div>

          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger rounded-3">{error}</div>
          ) : !profile ? (
            <div className="alert alert-warning rounded-3">Không tìm thấy thông tin tài khoản!</div>
          ) : (
            <div>
              <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-4">
                <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}>
                  <i className="fa-solid fa-user fs-3"></i>
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0">{profile.userDetails ? `${profile.userDetails.firstName} ${profile.userDetails.lastName}` : "Chưa cập nhật"}</h5>
                  <span className="badge bg-warning text-dark fw-bold">{profile.role ? profile.role.roleName : "ROLE_USER"}</span>
                </div>
              </div>

              <div className="mb-3 border-bottom pb-2">
                <span className="text-muted d-block" style={{ fontSize: "0.85rem" }}>Tên đăng nhập</span>
                <span className="fw-bold text-dark fs-6">{profile.userName}</span>
              </div>

              <div className="mb-3 border-bottom pb-2">
                <span className="text-muted d-block" style={{ fontSize: "0.85rem" }}>Email phụ huynh</span>
                <span className="fw-bold text-dark fs-6">{profile.userDetails ? profile.userDetails.email : "N/A"}</span>
              </div>

              <div className="mb-4 border-bottom pb-2">
                <span className="text-muted d-block" style={{ fontSize: "0.85rem" }}>Trạng thái tài khoản</span>
                <span className={`badge ${profile.active === 1 ? 'bg-success' : 'bg-secondary'} px-3 py-1.5 rounded-pill`}>
                  {profile.active === 1 ? "Hoạt động" : "Tạm khóa"}
                </span>
              </div>

              <div className="text-center">
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>Cảm ơn phụ huynh đã đồng hành cùng MyKingdom trong việc phát triển tư duy của trẻ!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

export default ProfilePage;
