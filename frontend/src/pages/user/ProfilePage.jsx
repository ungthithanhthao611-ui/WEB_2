import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProfile } from "../../services/authService";
import { getRecommendationsByUser } from "../../services/recommendationService";
import UserLayout from "../../layouts/UserLayout";
import "./ProfilePage.css";

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
      <div className="container mt-4 pb-5 profile-page-container">
        <div className="profile-card">
          <div className="profile-header">
            <h3 className="profile-title">THÔNG TIN TÀI KHOẢN</h3>
            <div className="profile-subtitle">Thông tin thành viên Highlands Coffee</div>
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
            <>
              <div className="profile-banner">
                <img src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1000&auto=format&fit=crop" alt="Banner" className="profile-banner-img" />
                <div className="profile-banner-content">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                      <i className="fa-solid fa-user"></i>
                    </div>
                  </div>
                  <div className="profile-user-info">
                    <h4>{profile.userDetails ? `${profile.userDetails.firstName} ${profile.userDetails.lastName}` : profile.userName}</h4>
                    <span className="profile-role-badge">{profile.role ? profile.role.roleName : "ROLE_USER"}</span>
                  </div>
                </div>
              </div>

              <div className="profile-info-list">
                <div className="profile-info-item">
                  <div className="profile-info-icon"><i className="fa-regular fa-user"></i></div>
                  <div className="profile-info-text">
                    <div className="profile-info-label">Tên đăng nhập</div>
                    <div className="profile-info-value">{profile.userName}</div>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon"><i className="fa-regular fa-envelope"></i></div>
                  <div className="profile-info-text">
                    <div className="profile-info-label">Email khách hàng</div>
                    <div className="profile-info-value">{profile.userDetails ? profile.userDetails.email : "N/A"}</div>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon"></div>
                  <div className="profile-info-text">
                    <div className="profile-info-label">Trạng thái tài khoản</div>
                    <div className="profile-info-value">
                      {profile.active === 1 ? (
                        <span className="status-badge"><i className="fa-solid fa-circle-check"></i> Hoạt động</span>
                      ) : (
                        <span className="status-badge bg-secondary"><i className="fa-solid fa-ban"></i> Tạm khóa</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="profile-footer-text">
                Cảm ơn bạn đã đồng hành cùng Highlands Coffee. Mỗi ly cà phê là một trải nghiệm đậm đà vị Việt.
              </p>

              <div className="profile-actions">
                <Link to="/orders" className="btn-profile-outline">
                  <i className="fa-solid fa-bag-shopping"></i> Đơn hàng
                </Link>
                <Link to="/wishlist" className="btn-profile-solid">
                  <i className="fa-solid fa-heart"></i> Yêu thích
                </Link>
                <Link to="/notifications" className="btn-profile-outline bg-light">
                  <i className="fa-regular fa-bell"></i> Thông báo
                </Link>
              </div>
            </>
          )}
        </div>

        {/* My Reviews Section */}
        {!loading && !error && profile && (
          <div className="profile-card">
            <h3 className="reviews-section-title"><i className="fa-solid fa-star text-warning"></i> Lịch sử đánh giá của tôi</h3>
            
            {reviews.length === 0 ? (
              <div className="empty-reviews-banner">
                <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop" alt="Tea Plantation" className="empty-reviews-bg" />
                <div className="empty-reviews-content">
                  <i className="fa-regular fa-comment-dots"></i>
                  <p>Bạn chưa viết đánh giá nào.</p>
                  <small>Khám phá sản phẩm và chia sẻ trải nghiệm của bạn!</small>
                  <Link to="/products">Khám phá ngay</Link>
                </div>
              </div>
            ) : (
              <div className="row g-4 mt-1 position-relative" style={{ zIndex: 1 }}>
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
