import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";

function DashboardPage() {
  return (
    <AdminLayout>
      <div className="container mt-4">
        <h2 className="fw-bold mb-4">Dashboard Quản Trị Hệ Thống</h2>

        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card border-0 bg-primary text-white shadow rounded-4 p-4">
              <h5>Tổng Sản Phẩm</h5>
              <h2 className="fw-bold">12</h2>
              <Link to="/admin/products" className="text-white-50 text-decoration-none">Quản lý sản phẩm &rarr;</Link>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-success text-white shadow rounded-4 p-4">
              <h5>Danh Mục</h5>
              <h2 className="fw-bold">4</h2>
              <Link to="/admin/categories" className="text-white-50 text-decoration-none">Quản lý danh mục &rarr;</Link>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-warning text-dark shadow rounded-4 p-4">
              <h5>Đơn Hàng</h5>
              <h2 className="fw-bold">8</h2>
              <Link to="/admin/orders" className="text-dark-50 text-decoration-none">Xem chi tiết đơn hàng &rarr;</Link>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-info text-white shadow rounded-4 p-4">
              <h5>Người Dùng</h5>
              <h2 className="fw-bold">3</h2>
              <Link to="/admin/users" className="text-white-50 text-decoration-none">Quản lý tài khoản &rarr;</Link>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4 p-4">
          <h4 className="fw-bold mb-3">Thông tin dự án E-Commerce Microservices</h4>
          <p className="text-muted mb-0">Hệ thống đang hoạt động và giám sát tất cả 7 services thông qua Netflix Eureka Server. Bạn có thể sử dụng các thanh điều hướng bên trái hoặc trên header để truy cập sâu vào các tính năng cấu hình dữ liệu.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
