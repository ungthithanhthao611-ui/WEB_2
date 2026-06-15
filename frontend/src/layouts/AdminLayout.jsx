import AdminSidebar from "../components/AdminSidebar";

function AdminLayout({ children }) {
  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#fdf6ec" }}>
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>
        <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom bg-white rounded-4 px-4 py-3 shadow-sm">
          <h4 className="fw-bold text-dark mb-0">Hệ thống quản trị</h4>
          <span
            className="badge px-3 py-2 fs-6 text-white"
            style={{ backgroundColor: "#e30613" }}
          >
            Đã xác thực Admin
          </span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
