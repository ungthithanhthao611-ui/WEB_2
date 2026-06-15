import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getOrderDashboard } from "../../services/orderService";

const initial = { totalOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0, revenue: 0 };

function DashboardPage() {
  const [stats, setStats] = useState(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderDashboard().then(({ data }) => setStats(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = [
    ["Đơn hàng", stats.totalOrders, "bg-primary", "/admin/orders"],
    ["Chờ xác nhận", stats.pendingOrders, "bg-warning text-dark", "/admin/orders"],
    ["Đã hoàn thành", stats.completedOrders, "bg-success", "/admin/orders"],
    ["Đã hủy / từ chối", stats.cancelledOrders, "bg-danger", "/admin/orders"],
  ];

  return <AdminLayout><div className="container py-4">
    <div className="d-flex justify-content-between align-items-end mb-4">
      <div><p className="text-danger fw-bold mb-1">TRUNG TÂM VẬN HÀNH</p><h2 className="fw-bold mb-0">Dashboard quản trị</h2></div>
      <span className="text-muted">{loading ? "Đang cập nhật..." : "Dữ liệu trực tiếp từ hệ thống đơn hàng"}</span>
    </div>
    <div className="row g-4 mb-4">{cards.map(([label, value, color, link]) => <div className="col-sm-6 col-xl-3" key={label}>
      <div className={`card border-0 shadow-sm rounded-4 p-4 h-100 text-white ${color}`}><small className="fw-semibold">{label}</small><h2 className="fw-bold my-2">{value}</h2><Link to={link} className="text-reset text-decoration-none opacity-75">Xem chi tiết →</Link></div>
    </div>)}</div>
    <div className="card border-0 shadow-sm rounded-4 p-4"><span className="text-muted">Doanh thu từ đơn hoàn thành</span><h1 className="fw-bold text-success mt-2">{Number(stats.revenue || 0).toLocaleString("vi-VN")}đ</h1><p className="mb-0 text-muted">Không tính các đơn đang chờ, đã hủy hoặc bị từ chối.</p></div>
  </div></AdminLayout>;
}

export default DashboardPage;
