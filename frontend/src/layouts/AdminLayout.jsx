import AdminSidebar from "../components/AdminSidebar";

function AdminLayout({ children }) {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>
        <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
          <h4 className="fw-bold text-dark">Hệ thống quản trị</h4>
          <span className="badge bg-primary px-3 py-2 fs-6">Đã xác thực Admin</span>
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
