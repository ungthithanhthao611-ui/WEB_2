import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getOrderDashboard, getPendingOrderCount, getAllOrders } from "../../services/orderService";
import { getProducts } from "../../services/productService";
import { getAllUsers } from "../../services/authService";
import { getCampaignBanners } from "../../services/shopConfigService";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function DashboardPage() {
  const [stats, setStats] = useState({ revenueData: [] });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    newOrders: 0,
    newUsers: 0,
    outOfStock: 0,
    activeBanners: 0,
    recentOrders: []
  });

  useEffect(() => {
    Promise.allSettled([
      getOrderDashboard(),
      getPendingOrderCount(),
      getAllUsers(),
      getProducts(),
      getAllOrders()
    ]).then(([orderRes, pendingRes, usersRes, prodRes, allOrdersRes]) => {
      if (orderRes.status === 'fulfilled') setStats(orderRes.value.data);
      
      const outOfStockCount = prodRes.status === 'fulfilled' 
        ? prodRes.value.data.filter(p => !p.active || p.stock <= 0).length 
        : 0;
        
      const activeBannersCount = getCampaignBanners().length;
      
      const recent = allOrdersRes.status === 'fulfilled' 
        ? allOrdersRes.value.data.sort((a, b) => b.id - a.id).slice(0, 5) 
        : [];

      setDashboardData({
        newOrders: pendingRes.status === 'fulfilled' ? pendingRes.value.data : 0,
        newUsers: usersRes.status === 'fulfilled' ? usersRes.value.data.length : 0,
        outOfStock: outOfStockCount,
        activeBanners: activeBannersCount,
        recentOrders: recent
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status) => {
    if (["PENDING_CONFIRMATION", "PENDING_USER_DECISION"].includes(status)) return { bg: "#fef3c7", text: "#d97706", label: "Pending" };
    if (["CONFIRMED", "PREPARING"].includes(status)) return { bg: "#e0e7ff", text: "#4f46e5", label: "Processing" };
    if (status === "SHIPPING") return { bg: "#dcfce7", text: "#16a34a", label: "Shipping" };
    if (status === "COMPLETED") return { bg: "#dcfce7", text: "#16a34a", label: "Completed" };
    if (["CANCELLED", "REJECTED"].includes(status)) return { bg: "#fee2e2", text: "#dc2626", label: "Cancelled" };
    return { bg: "#f3f4f6", text: "#4b5563", label: status };
  };

  return (
    <AdminLayout>
      <style>{`
        .admin-dashboard-wrapper {
          background-color: #fcfbf9;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: #333;
        }
        .db-header {
          margin-bottom: 2rem;
        }
        .db-title {
          font-weight: 800;
          font-size: 1.8rem;
          color: #1a1a1a;
        }
        .db-subtitle {
          color: #6b7280;
          font-size: 1rem;
        }
        .db-card-dark {
          background: linear-gradient(135deg, #422918 0%, #29180c 100%);
          color: white;
          border-radius: 20px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(66, 41, 24, 0.25);
        }
        .db-card-dark .icon-wrap {
          background: rgba(255, 255, 255, 0.1);
          width: 45px; height: 45px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 0 15px rgba(255, 138, 172, 0.4);
          color: #ffb8c6;
        }
        .db-card-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
        }
        .db-card-glass .icon-wrap {
          width: 45px; height: 45px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }
        .icon-users { background: #e2e8f0; color: #475569; }
        .icon-stock { background: #d7bfa6; color: #5c4033; }
        .icon-banner { background: #ccfbf1; color: #0f766e; }
        .db-card-value {
          font-size: 2.2rem;
          font-weight: 700;
          margin-top: 1rem;
        }
        .pill-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .pill-green { background: #dcfce7; color: #16a34a; }
        .pill-red { background: #fee2e2; color: #dc2626; }
        
        .db-panel {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          height: 100%;
        }
        .db-panel-title {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .db-table th {
          color: #6b7280;
          font-weight: 600;
          font-size: 0.9rem;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 1rem;
        }
        .db-table td {
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
          font-size: 0.95rem;
        }
        .db-table tr:last-child td { border-bottom: none; }
        
        .status-pill {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
        }
      `}</style>
      
      <div className="admin-dashboard-wrapper p-4">
        <div className="db-header">
          <div className="db-subtitle mb-1">Xin chào, Admin!</div>
          <div className="d-flex justify-content-between align-items-end">
            <h1 className="db-title mb-0">Dashboard Quản trị</h1>
            <div className="db-subtitle"><i className="fa-solid fa-border-all me-2"></i>Tổng quan hệ thống</div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6 col-xl-3">
            <Link to="/admin/orders" className="text-decoration-none">
              <div className="db-card-dark h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-wrap"><i className="fa-solid fa-cart-arrow-down"></i></div>
                  <div>
                    <div className="fw-bold fs-6">Đơn hàng mới</div>
                    <div className="small opacity-75">New Orders</div>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-end mt-3">
                  <div className="db-card-value">{loading ? "..." : dashboardData.newOrders}</div>
                  <div className="pill-badge pill-green">+15%</div>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="col-12 col-md-6 col-xl-3">
            <Link to="/admin/users" className="text-decoration-none text-dark">
              <div className="db-card-glass h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-wrap icon-users"><i className="fa-solid fa-user"></i></div>
                  <div>
                    <div className="fw-bold fs-6">Người dùng mới</div>
                    <div className="text-muted small">New Users</div>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-end mt-3">
                  <div className="db-card-value">{loading ? "..." : dashboardData.newUsers}</div>
                  <div className="pill-badge pill-green">+8%</div>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <Link to="/admin/products" className="text-decoration-none text-dark">
              <div className="db-card-glass h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-wrap icon-stock"><i className="fa-solid fa-mug-hot"></i></div>
                  <div>
                    <div className="fw-bold fs-6">Sản phẩm hết hàng</div>
                    <div className="text-muted small">Out of Stock Products</div>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-end mt-3">
                  <div className="db-card-value">{loading ? "..." : dashboardData.outOfStock}</div>
                  <div className="pill-badge pill-red">-2%</div>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="db-card-glass h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrap icon-banner"><i className="fa-solid fa-image"></i></div>
                <div>
                  <div className="fw-bold fs-6">Hệ thống Banner</div>
                  <div className="text-muted small">Active Banners</div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end mt-3">
                <div className="db-card-value">{loading ? "..." : dashboardData.activeBanners}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="db-panel">
              <div className="db-panel-title">
                Biểu đồ Doanh thu
                <button className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold text-muted">
                  <i className="fa-solid fa-chart-line me-2"></i>Doanh thu
                </button>
              </div>
              <div style={{ width: '100%', height: 320 }}>
                {stats.revenueData && stats.revenueData.length > 0 ? (
                  <ResponsiveContainer>
                    <AreaChart data={stats.revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5a2b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5a2b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                        formatter={(value) => Number(value).toLocaleString("vi-VN") + "đ"} 
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6b4423" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex h-100 align-items-center justify-content-center text-muted">Chưa có dữ liệu</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-lg-6">
            <div className="db-panel overflow-auto">
              <div className="db-panel-title">
                Xử lý đơn hàng
                <button className="btn btn-sm btn-light border rounded-pill px-3 text-muted"><i className="fa-solid fa-list me-2"></i>Lý đơn hàng</button>
              </div>
              {dashboardData.recentOrders.length === 0 ? (
                <div className="text-center text-muted py-5">Chưa có đơn hàng nào</div>
              ) : (
                <table className="table db-table table-borderless">
                  <thead>
                    <tr>
                      <th className="ps-2">Order ID <i className="fa-solid fa-arrow-down ms-1" style={{fontSize: '0.7rem'}}></i></th>
                      <th>Customer Name</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th className="text-end pe-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentOrders.map(o => {
                      const st = getStatusStyle(o.status);
                      return (
                        <tr key={o.id}>
                          <td className="ps-2 fw-semibold text-dark">#{o.id}</td>
                          <td className="text-dark">{o.user?.userName || "Khách"}</td>
                          <td>{o.items?.length || 0} Items</td>
                          <td className="fw-semibold text-dark">{(o.total || 0).toLocaleString()} VNĐ</td>
                          <td className="text-end pe-2">
                            <span className="status-pill" style={{ backgroundColor: st.bg, color: st.text }}>
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
