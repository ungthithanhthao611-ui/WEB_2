import { useEffect, useState } from "react";
import { getUserProfile } from "../../services/authService";
import { getRecommendationsByUser } from "../../services/recommendationService";
import UserLayout from "../../layouts/UserLayout";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);

  const loadProfile = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await getUserProfile(userId);
      setProfile(res.data);
      
      const reviewRes = await getRecommendationsByUser(userId);
      setReviews(reviewRes.data || []);
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
            <p className="text-muted">Thông tin thành viên Highlands Coffee</p>
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
                <span className="text-muted d-block" style={{ fontSize: "0.85rem" }}>Email khách hàng</span>
                <span className="fw-bold text-dark fs-6">{profile.userDetails ? profile.userDetails.email : "N/A"}</span>
              </div>

              <div className="mb-4 border-bottom pb-2">
                <span className="text-muted d-block" style={{ fontSize: "0.85rem" }}>Trạng thái tài khoản</span>
                <span className={`badge ${profile.active === 1 ? 'bg-success' : 'bg-secondary'} px-3 py-1.5 rounded-pill`}>
                  {profile.active === 1 ? "Hoạt động" : "Tạm khóa"}
                </span>
              </div>

              <div className="text-center mt-4">
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>Cảm ơn bạn đã đồng hành cùng Highlands Coffee. Mỗi ly cà phê là một trải nghiệm đậm đà vị Việt.</p>
                <a href="/orders" className="btn btn-outline-danger rounded-pill px-4">Theo dõi đơn hàng</a>
              </div>
            </div>
          )}
        </div>

        {/* My Reviews Section */}
        {!loading && !error && profile && (
          <div className="card shadow-sm border-0 rounded-5 p-4 bg-white mt-4 mb-5">
            <h4 className="fw-bold mb-4 text-dark"><i className="fa-solid fa-star text-warning me-2"></i>Lịch sử đánh giá của tôi</h4>
            {reviews.length === 0 ? (
              <div className="alert alert-light text-center border rounded-4 py-4">
                <i className="fa-regular fa-comment-dots fs-1 text-muted mb-3"></i>
                <p className="text-muted mb-0">Bạn chưa viết đánh giá nào.</p>
              </div>
            ) : (
              <div className="row g-4">
                {reviews.map((r, idx) => (
                  <div className="col-md-6" key={r.id || idx}>
                    <div className="card h-100 border rounded-4 p-3 shadow-sm" style={{ backgroundColor: "#fdfdfd" }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="fw-bold text-dark">{r.product?.productName || "Sản phẩm"}</div>
                        <div className="text-warning small">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={i < r.rating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                          ))}
                        </div>
                      </div>
                      <small className="text-muted mb-2 d-block">
                        <i className="fa-regular fa-calendar me-1"></i> 
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
                      </small>
                      <p className="mb-3 flex-grow-1" style={{ fontSize: "0.95rem" }}>
                        "{r.comment}"
                      </p>
                      {r.imageUrl && (
                        <div className="mt-auto">
                          <img src={r.imageUrl} alt="Review" className="img-fluid rounded-3" style={{ maxHeight: "120px", objectFit: "cover" }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default ProfilePage;
