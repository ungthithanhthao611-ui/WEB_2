import AdminLayout from "../../layouts/AdminLayout";

function AdminUserPage() {
  return (
    <AdminLayout>
      <div className="container mt-4">
        <h2 className="fw-bold mb-4">Quản Lý Người Dùng</h2>
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <p className="text-muted mb-0">Tính năng quản lý phân quyền nâng cao đang được thiết lập qua JWT và cơ sở dữ liệu.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminUserPage;
