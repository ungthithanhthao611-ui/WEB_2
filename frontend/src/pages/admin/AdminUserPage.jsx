import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAllUsers, deleteUser } from "../../services/authService";
import { showToast } from "../../services/shopConfigService";

function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data || []);
    } catch (error) {
      console.error(error);
      if (error.response?.status !== 404) {
        showToast("Lỗi lấy danh sách người dùng", "error");
      } else {
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await deleteUser(id);
      showToast("Đã xóa người dùng thành công", "success");
      fetchUsers();
    } catch (error) {
      console.error(error);
      showToast("Xóa người dùng thất bại", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h2 className="fw-bold mb-4">Quản Lý Người Dùng</h2>
        
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center my-4 p-4 text-muted">Chưa có người dùng nào.</div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="py-3">Tài khoản</th>
                  <th className="py-3">Họ tên</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Vai trò</th>
                  <th className="py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 fw-bold">#{u.id}</td>
                    <td className="py-3">{u.userName}</td>
                    <td className="py-3">{u.userDetails ? `${u.userDetails.firstName || ""} ${u.userDetails.lastName || ""}` : "-"}</td>
                    <td className="py-3 text-primary">{u.userDetails?.email || "-"}</td>
                    <td className="py-3">
                      <span className={`badge ${u.role?.roleName === "ROLE_ADMIN" ? "bg-danger" : u.role?.roleName === "ROLE_STAFF" ? "bg-info text-dark" : "bg-secondary"}`}>
                        {u.role?.roleName?.replace("ROLE_", "") || "USER"}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button 
                        className="btn btn-outline-danger btn-sm rounded-3 px-3" 
                        onClick={() => handleDelete(u.id)}
                        disabled={u.role?.roleName === "ROLE_ADMIN"}
                      >
                        <i className="fa-solid fa-trash me-1"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminUserPage;
