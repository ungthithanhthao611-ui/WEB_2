import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from "../../services/authService";
import UserLayout from "../../layouts/UserLayout";

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;
    try {
      const res = await getUserNotifications(userId);
      setNotifications(res.data);
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;
    try {
      await markAllNotificationsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <UserLayout>
      <div className="container mt-4" style={{ maxWidth: "700px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <Link to="/profile" className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px" }}>
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <h2 className="fw-bold mb-0">Thông báo của tôi</h2>
          </div>
          {notifications.some(n => !n.read) && (
            <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleMarkAllAsRead}>
              <i className="fa-solid fa-check-double me-1"></i> Đánh dấu đã đọc tất cả
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="alert alert-light text-center py-5 border rounded-4">
            <i className="fa-regular fa-bell-slash fs-1 text-muted mb-3"></i>
            <p className="text-muted mb-0">Bạn chưa có thông báo nào.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`list-group-item list-group-item-action p-4 ${!n.read ? 'bg-light' : 'bg-white'}`}
                style={{ borderLeft: !n.read ? '4px solid #b22830' : '4px solid transparent', cursor: 'default' }}
              >
                <div className="d-flex w-100 justify-content-between align-items-start mb-2">
                  <h6 className={`mb-0 ${!n.read ? 'fw-bold' : ''}`}>{n.title || "Thông báo hệ thống"}</h6>
                  <small className="text-muted" style={{ fontSize: "0.8rem", minWidth: "80px", textAlign: "right" }}>
                    {new Date(n.createdAt).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
                <p className="mb-2 text-dark" style={{ fontSize: "0.95rem", whiteSpace: "pre-line" }}>{n.message}</p>
                {!n.read && (
                  <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" onClick={() => handleMarkAsRead(n.id)}>
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default NotificationPage;
