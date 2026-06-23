import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getOrderDashboard } from "../../services/orderService";
import { getProducts, getCategories } from "../../services/productService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const initial = { totalOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0, revenue: 0 };

function DashboardPage() {
  const [stats, setStats] = useState(initial);
  const [extraStats, setExtraStats] = useState({ products: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getOrderDashboard(),
      getProducts(),
      getCategories()
    ]).then(([orderRes, prodRes, catRes]) => {
      if (orderRes.status === 'fulfilled') {
        setStats(orderRes.value.data);
      }
      setExtraStats({
        products: prodRes.status === 'fulfilled' && prodRes.value.data ? prodRes.value.data.length : 0,
        categories: catRes.status === 'fulfilled' && catRes.value.data ? catRes.value.data.length : 0
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = [
    ["Đơn hàng", stats.totalOrders, "bg-primary", "/admin/orders"],
    ["Chờ xác nhận", stats.pendingOrders, "bg-warning text-dark", "/admin/orders"],
    ["Tổng Sản phẩm", extraStats.products, "bg-success", "/admin/products"],
    ["Tổng Danh mục", extraStats.categories, "bg-info text-dark", "/admin/categories"],
  ];

  return <AdminLayout><div className="container py-4">
    <div className="d-flex justify-content-between align-items-end mb-4">
      <div><p className="text-danger fw-bold mb-1">TRUNG TÂM VẬN HÀNH</p><h2 className="fw-bold mb-0">Dashboard quản trị</h2></div>
      <span className="text-muted">{loading ? "Đang cập nhật..." : "Dữ liệu trực tiếp từ hệ thống đơn hàng"}</span>
    </div>
    <div className="row g-4 mb-4">{cards.map(([label, value, color, link]) => <div className="col-sm-6 col-xl-3" key={label}>
      <div className={`card border-0 shadow-sm rounded-4 p-4 h-100 text-white ${color}`}><small className="fw-semibold">{label}</small><h2 className="fw-bold my-2">{value}</h2><Link to={link} className="text-reset text-decoration-none opacity-75">Xem chi tiết →</Link></div>
    </div>)}</div>
    
    <div className="row g-4 mb-4">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
          <h5 className="fw-bold mb-4">Doanh thu theo ngày</h5>
          <div style={{ width: '100%', height: 300 }}>
            {stats.revenueData && stats.revenueData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={stats.revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => Number(value).toLocaleString("vi-VN") + "đ"} />
                  <Legend />
                  <Line type="monotone" name="Doanh thu (VNĐ)" dataKey="revenue" stroke="#198754" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="d-flex h-100 align-items-center justify-content-center text-muted">Chưa có dữ liệu doanh thu</div>
            )}
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
          <h5 className="fw-bold mb-4">Tỉ lệ danh mục</h5>
          <div style={{ width: '100%', height: 300 }}>
            {stats.categoryData && stats.categoryData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.categoryData.map((entry, index) => {
                      const COLORS = ['#0d6efd', '#dc3545', '#ffc107', '#198754', '#0dcaf0', '#6610f2'];
                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="d-flex h-100 align-items-center justify-content-center text-muted">Chưa có dữ liệu danh mục</div>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="card border-0 shadow-sm rounded-4 p-4"><span className="text-muted">Tổng doanh thu lịch sử</span><h1 className="fw-bold text-success mt-2">{Number(stats.revenue || 0).toLocaleString("vi-VN")}đ</h1><p className="mb-0 text-muted">Không tính các đơn đang chờ, đã hủy hoặc bị từ chối.</p></div>
  </div></AdminLayout>;
}

export default DashboardPage;
