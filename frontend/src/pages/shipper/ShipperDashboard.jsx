import React, { useState, useEffect } from 'react';
import { showToast } from '../../services/shopConfigService';
import { getAllOrders, assignOrderToShipper, updateOrderStatus } from '../../services/orderService';
import DashboardHeader from '../../components/DashboardHeader';

const ShipperDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = sessionStorage.getItem("userId");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("ACTIVE"); // "ACTIVE" or "HISTORY"

  const loadOrders = async () => {
    try {
      const res = await getAllOrders();
      const sorted = (res.data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (error) {
      console.error(error);
      showToast('Lỗi lấy dữ liệu đơn hàng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePickup = async (orderId) => {
    try {
      await assignOrderToShipper(orderId, Number(currentUserId));
      showToast('Nhận đơn đi giao thành công!');
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      showToast('Có lỗi xảy ra khi nhận đơn đi giao!', 'error');
    }
  };

  const handleDelivered = async (orderId) => {
    if(!window.confirm("Xác nhận bạn đã thu đủ tiền và giao hàng thành công?")) return;
    try {
      await updateOrderStatus(orderId, 'COMPLETED');
      showToast('Giao hàng thành công!');
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      showToast('Lỗi cập nhật trạng thái giao hàng!', 'error');
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === "ACTIVE") {
      return orders.filter(o => 
        o.status === 'READY_FOR_PICKUP' || 
        (o.status === 'DELIVERING' && Number(o.shipperId) === Number(currentUserId))
      );
    } else {
      return orders.filter(o => 
        o.status === 'COMPLETED' && Number(o.shipperId) === Number(currentUserId)
      );
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div className="container">
        <DashboardHeader title="Trạm Giao Hàng" iconClass="fa-solid fa-motorcycle" />
        <div className="d-flex justify-content-end mb-4">
          <button className="btn btn-outline-primary shadow-sm rounded-pill px-4" onClick={loadOrders}>
            <i className="fa-solid fa-rotate-right me-2"></i>Làm mới
          </button>
        </div>

        {/* Tab Selector */}
        <div className="card shadow-sm border-0 rounded-4 mb-4 p-2 bg-white">
          <ul className="nav nav-pills flex-nowrap overflow-auto" style={{whiteSpace: "nowrap"}}>
            <li className="nav-item">
              <button className={`nav-link rounded-pill fw-semibold px-4 py-2 ${activeTab === "ACTIVE" ? "active bg-primary text-white" : "text-dark"}`} onClick={() => setActiveTab("ACTIVE")}>
                Nhiệm vụ giao hàng
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link rounded-pill fw-semibold px-4 py-2 ${activeTab === "HISTORY" ? "active bg-primary text-white" : "text-dark"}`} onClick={() => setActiveTab("HISTORY")}>
                Lịch sử đã giao
              </button>
            </li>
          </ul>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="alert alert-light border-0 shadow-sm text-center py-5 rounded-4">
            <i className="fa-solid fa-box-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <h5 className="text-muted">
              {activeTab === "ACTIVE" ? "Hiện không có đơn hàng nào cần giao!" : "Bạn chưa hoàn thành đơn hàng nào."}
            </h5>
          </div>
        ) : (
          <div className="row g-4">
            {filteredOrders.map(order => (
              <div className="col-12 col-md-6 col-lg-4" key={order.id}>
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style={{ transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  {order.status === 'DELIVERING' && <div className="position-absolute top-0 start-0 w-100 bg-info" style={{height: '4px'}}></div>}
                  {order.status === 'READY_FOR_PICKUP' && <div className="position-absolute top-0 start-0 w-100 bg-warning" style={{height: '4px'}}></div>}
                  {order.status === 'COMPLETED' && <div className="position-absolute top-0 start-0 w-100 bg-success" style={{height: '4px'}}></div>}
                  
                  <div className="card-body p-4 pb-2">
                    <div className="d-flex justify-content-between mb-3">
                      <span className="badge bg-light text-dark border fw-bold fs-6">Đơn #{order.id}</span>
                      <span className={`badge ${order.status === 'DELIVERING' ? 'bg-info text-dark' : order.status === 'COMPLETED' ? 'bg-success text-white' : 'bg-warning text-dark'} d-flex align-items-center px-3 rounded-pill`}>
                        {order.status === 'READY_FOR_PICKUP' ? 'Chờ lấy hàng' : order.status === 'DELIVERING' ? 'Đang đi giao...' : 'Đã hoàn thành'}
                      </span>
                    </div>

                    <h4 className="text-danger fw-bold mb-3">{order.total?.toLocaleString()} đ <small className="text-muted fs-6 fw-normal">(COD)</small></h4>

                    <div className="bg-light rounded-3 p-3 mb-3">
                      <p className="mb-2 fw-bold"><i className="fa-solid fa-user text-muted me-2"></i> {order.user?.userName || order.recipientName || 'Khách hàng'}</p>
                      <p className="mb-2 text-primary fw-semibold"><i className="fa-solid fa-phone me-2"></i> {order.phone || 'Chưa cung cấp SĐT'}</p>
                      <p className="mb-0 small text-muted"><i className="fa-solid fa-location-dot me-2 text-danger"></i> {order.deliveryAddress || order.shippingAddress || order.address || 'Không rõ địa chỉ'}</p>
                      {order.note && <p className="mb-0 mt-2 text-danger small"><i className="fa-solid fa-note-sticky me-1"></i> Ghi chú: {order.note}</p>}
                    </div>
                  </div>

                  <div className="card-footer bg-white border-0 p-4 pt-0 d-flex flex-column gap-2">
                    <button className="btn btn-outline-secondary w-100 rounded-pill" onClick={() => setSelectedOrder(order)}>Xem chi tiết đơn</button>
                    {order.status === 'READY_FOR_PICKUP' ? (
                      <button className="btn btn-warning w-100 rounded-pill fw-bold text-dark shadow-sm" onClick={() => handlePickup(order.id)}>
                        <i className="fa-solid fa-hand-holding-hand me-2"></i> Nhận đi giao
                      </button>
                    ) : order.status === 'DELIVERING' ? (
                      <button className="btn btn-success w-100 rounded-pill fw-bold shadow-sm" onClick={() => handleDelivered(order.id)}>
                        <i className="fa-solid fa-check-circle me-2"></i> Xác nhận đã giao (Thu tiền)
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Chi tiết đơn hàng Shipper */}
      {selectedOrder && (
        <div className="modal d-block" style={{background:"rgba(0,0,0,.5)", backdropFilter: "blur(4px)"}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0 bg-light rounded-top-4">
                <h5 className="modal-title fw-bold text-primary"><i className="fa-solid fa-motorcycle me-2"></i> Chi tiết giao hàng #{selectedOrder.id}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body pt-4">
                <div className="text-center mb-4">
                  <p className="text-muted mb-1">Tổng tiền cần thu (COD)</p>
                  <h2 className="text-danger fw-extrabold mb-0">{selectedOrder.total?.toLocaleString()} đ</h2>
                </div>
                
                <div className="border rounded-4 p-3 mb-4">
                  <h6 className="fw-bold mb-3 border-bottom pb-2">Thông tin người nhận</h6>
                  <p className="mb-2"><i className="fa-solid fa-user me-2 text-muted"></i> <strong>{selectedOrder.user?.userName || selectedOrder.recipientName || 'Chưa rõ'}</strong></p>
                  <p className="mb-2 text-primary fw-bold"><i className="fa-solid fa-phone me-2 text-muted"></i> {selectedOrder.phone || 'Chưa cung cấp'}</p>
                  <p className="mb-2"><i className="fa-solid fa-location-dot me-2 text-danger"></i> {selectedOrder.deliveryAddress || selectedOrder.shippingAddress || selectedOrder.address || 'Không rõ địa chỉ'}</p>
                  {selectedOrder.note && <p className="mb-0 text-danger bg-danger-subtle p-2 rounded mt-2"><i className="fa-solid fa-circle-exclamation me-1"></i> <strong>Khách ghi chú:</strong> {selectedOrder.note}</p>}
                </div>

                <h6 className="fw-bold mb-3">Món khách đặt (Để đối chiếu):</h6>
                <ul className="list-group list-group-flush mb-0">
                  {selectedOrder.items?.map((item, idx) => (
                    <li className="list-group-item px-0 d-flex justify-content-between align-items-center" key={idx}>
                      <span>{item.productNameSnapshot || item.product?.productName}</span>
                      <span className="badge bg-secondary rounded-pill">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer border-top-0 pt-0 bg-light rounded-bottom-4">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedOrder(null)}>Đóng</button>
                {selectedOrder.status === 'READY_FOR_PICKUP' ? (
                  <button type="button" className="btn btn-warning rounded-pill px-4 text-dark fw-bold" onClick={() => handlePickup(selectedOrder.id)}>Nhận đi giao</button>
                ) : selectedOrder.status === 'DELIVERING' ? (
                  <button type="button" className="btn btn-success rounded-pill px-4 fw-bold" onClick={() => handleDelivered(selectedOrder.id)}>Đã giao & Thu tiền</button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperDashboard;
