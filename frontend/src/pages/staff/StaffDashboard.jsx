import React, { useState, useEffect } from 'react';
import { showToast } from '../../services/shopConfigService';
import { getAllOrders, assignOrderToStaff, updateOrderStatus } from '../../services/orderService';
import DashboardHeader from '../../components/DashboardHeader';

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = sessionStorage.getItem("userId");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [packedOrders, setPackedOrders] = useState([]);

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

  const handleConfirm = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'CONFIRMED');
      showToast('Đã xác nhận đơn hàng!');
      loadOrders();
    } catch (e) {
      showToast('Lỗi xác nhận đơn!', 'error');
    }
  };

  const handleAssign = async (orderId) => {
    try {
      await assignOrderToStaff(orderId, Number(currentUserId));
      showToast('Đã nhận làm món!');
      loadOrders();
    } catch (error) {
      showToast('Có lỗi xảy ra khi nhận đơn!', 'error');
    }
  };

  const handlePacked = (orderId) => {
    setPackedOrders(prev => [...prev, orderId]);
    showToast('Đã xong món! Hãy bấm Chuyển Shipper để giao đi.');
  };

  const handleReadyForPickup = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'READY_FOR_PICKUP');
      setPackedOrders(prev => prev.filter(id => id !== orderId));
      showToast('Đã chuyển cho Shipper!');
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      showToast('Lỗi cập nhật trạng thái!', 'error');
    }
  };

  const handlePrintTicket = (order) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    const itemsHtml = (order.items || []).map(item => `
      <tr style="border-bottom: 1px dashed #000;">
        <td style="padding: 8px 0; font-weight: bold; font-size: 14px; font-family: 'Courier New', Courier, monospace; text-align: left;">
          x${item.quantity} ${item.productNameSnapshot || item.product?.productName || "Sản phẩm"}
        </td>
        <td style="padding: 8px 0; text-align: right; font-size: 14px; font-family: 'Courier New', Courier, monospace; font-weight: bold; width: 60px;">
          ${item.size || 'Size M'}
        </td>
      </tr>
    `).join('');

    const customerName = order.recipientName || order.user?.userName || 'Khách hàng';
    const phone = order.phone || 'Chưa cung cấp SĐT';
    const address = order.deliveryAddress || order.shippingAddress || order.address || 'Giao tại cửa hàng';
    const store = order.store || 'Chi nhánh Highlands';
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
    const payment = order.paymentMethod || 'Chưa xác định';
    const total = order.total ? `${order.total.toLocaleString()} đ` : '0 đ';

    doc.write(`
      <html>
        <head>
          <style>
            @media print {
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: flex-start; background-color: #fff; }
              .ticket-container { width: 80mm; padding: 15px; box-sizing: border-box; }
              .logo-container { text-align: center; margin-bottom: 10px; }
              .logo-text { font-size: 20px; font-weight: bold; letter-spacing: 1px; margin: 0; }
              .ticket-header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
              .ticket-title { font-size: 18px; font-weight: bold; margin: 5px 0 0 0; }
              
              .info-section { font-size: 13px; margin-bottom: 15px; line-height: 1.5; border-bottom: 2px dashed #000; padding-bottom: 10px; }
              .info-row { display: flex; margin-bottom: 4px; }
              .info-label { font-weight: bold; width: 110px; flex-shrink: 0; text-align: left; }
              .info-value { text-align: left; flex-grow: 1; word-wrap: break-word; }
              
              .ticket-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
              .ticket-footer { text-align: center; font-size: 12px; border-top: 2px dashed #000; padding-top: 10px; margin-top: 15px; }
              .note-box { font-weight: bold; font-size: 13px; margin-top: 10px; border: 2px solid #000; padding: 8px; background-color: #f0f0f0; }
              .total-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="logo-container">
              <h2 class="logo-text">HIGHLANDS COFFEE</h2>
            </div>
            <div class="ticket-header">
              <h3 class="ticket-title">PHIẾU CHẾ BIẾN</h3>
              <p style="margin: 3px 0 0 0; font-size: 13px; font-weight: bold;">Đơn: #${order.id}</p>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Khách hàng:</span>
                <span class="info-value">${customerName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">SĐT:</span>
                <span class="info-value">${phone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Địa chỉ:</span>
                <span class="info-value">${address}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cửa hàng:</span>
                <span class="info-value">${store}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Thời gian:</span>
                <span class="info-value">${orderDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Thanh toán:</span>
                <span class="info-value">${payment}</span>
              </div>
            </div>
            
            <table class="ticket-table">
              <thead>
                <tr style="border-bottom: 2px solid #000;">
                  <th style="text-align: left; padding-bottom: 5px; font-size: 13px;">Tên món / SL</th>
                  <th style="text-align: right; padding-bottom: 5px; font-size: 13px; width: 60px;">Size</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total-row">
              <span>TỔNG CỘNG:</span>
              <span>${total}</span>
            </div>

            ${order.note ? `
              <div class="note-box">
                <span style="display: block; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px; font-size: 11px;">GHI CHÚ KHÁCH HÀNG:</span>
                ${order.note}
              </div>
            ` : ''}

            <div class="ticket-footer">
              <p style="margin: 0; font-weight: bold; font-size: 13px;">CHÚC QUÝ KHÁCH NGON MIỆNG!</p>
              <p style="margin: 4px 0 0 0; font-size: 9px; opacity: 0.8;">Hệ thống đặt món trực tuyến Highlands Coffee</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.frameElement.remove();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        <DashboardHeader title="Bếp & Đóng Gói" iconClass="fa-solid fa-kitchen-set" />
        <div className="d-flex justify-content-end mb-4">
          <button className="btn btn-outline-danger shadow-sm rounded-pill px-4" onClick={loadOrders}>
            <i className="fa-solid fa-rotate-right me-2"></i> Làm mới
          </button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-danger" style={{width: '3rem', height: '3rem'}}></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="alert alert-light border-0 shadow-sm text-center py-5 rounded-4">
            <i className="fa-solid fa-mug-hot text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <h5 className="text-muted">Hiện tại bếp đang rảnh rỗi! Chưa có đơn hàng nào.</h5>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map(order => (
              <div className="col-12 col-md-6 col-lg-4" key={order.id}>
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                  {order.status === 'PREPARING' ? (
                    <div className="position-absolute top-0 start-0 w-100 bg-warning" style={{height: '4px'}}></div>
                  ) : order.status === 'CONFIRMED' ? (
                    <div className="position-absolute top-0 start-0 w-100 bg-primary" style={{height: '4px'}}></div>
                  ) : order.status === 'PENDING_CONFIRMATION' ? (
                    <div className="position-absolute top-0 start-0 w-100 bg-danger" style={{height: '4px'}}></div>
                  ) : (
                    <div className="position-absolute top-0 start-0 w-100 bg-secondary" style={{height: '4px'}}></div>
                  )}
                  
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between mb-3">
                      <span className="badge bg-light text-dark border fw-bold fs-6">Đơn #{order.id}</span>
                      {order.status === 'PENDING_CONFIRMATION' && <span className="badge bg-danger text-white d-flex align-items-center px-3 rounded-pill">Chờ xác nhận</span>}
                      {order.status === 'CONFIRMED' && <span className="badge bg-primary text-white d-flex align-items-center px-3 rounded-pill">Đã xác nhận</span>}
                      {order.status === 'PREPARING' && !packedOrders.includes(order.id) && <span className="badge bg-warning text-dark d-flex align-items-center px-3 rounded-pill">Đang làm món</span>}
                      {order.status === 'PREPARING' && packedOrders.includes(order.id) && <span className="badge bg-success text-white d-flex align-items-center px-3 rounded-pill">Đã đóng gói</span>}
                      {order.status === 'READY_FOR_PICKUP' && <span className="badge bg-info text-dark d-flex align-items-center px-3 rounded-pill">Chờ Shipper lấy</span>}
                      {(order.status === 'SHIPPING' || order.status === 'DELIVERING') && <span className="badge bg-primary text-white d-flex align-items-center px-3 rounded-pill">Đang giao</span>}
                      {order.status === 'COMPLETED' && <span className="badge bg-success text-white d-flex align-items-center px-3 rounded-pill">Đã giao</span>}
                      {(order.status === 'CANCELLED' || order.status === 'REJECTED') && <span className="badge bg-secondary text-white d-flex align-items-center px-3 rounded-pill">Đã hủy</span>}
                    </div>

                    <div className="mb-3 bg-light rounded-3 p-3">
                      <p className="mb-1 fw-bold"><i className="fa-solid fa-user text-muted me-2"></i> {order.user?.userName || order.recipientName || 'Khách hàng'}</p>
                      <p className="mb-0 text-muted small"><i className="fa-solid fa-phone text-muted me-2"></i> {order.phone || 'Không có SĐT'}</p>
                      {order.note && <p className="mb-0 mt-2 text-danger small"><i className="fa-solid fa-note-sticky me-1"></i> Ghi chú: {order.note}</p>}
                    </div>

                    <div className="mb-4">
                      <p className="fw-bold mb-2">Chi tiết món:</p>
                      <ul className="list-unstyled mb-0 ms-2">
                        {order.items && order.items.map((item, idx) => (
                          <li key={idx} className="mb-1 d-flex justify-content-between align-items-center border-bottom pb-1">
                            <span><span className="text-danger fw-bold me-2">x{item.quantity}</span> {item.productNameSnapshot || item.product?.productName}</span>
                            <small className="text-muted">{item.size || 'Size M'}</small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="card-footer bg-white border-0 p-4 pt-0 d-flex gap-2 flex-wrap">
                    <button className="btn btn-outline-secondary flex-grow-1 rounded-pill fw-bold" onClick={() => setSelectedOrder(order)}>
                      Chi tiết
                    </button>
                    <button className="btn btn-outline-dark rounded-pill px-3 fw-bold" onClick={() => handlePrintTicket(order)} title="In phiếu chế biến">
                      <i className="fa-solid fa-print"></i>
                    </button>
                    {order.status === 'PENDING_CONFIRMATION' && (
                      <button className="btn btn-danger flex-grow-1 rounded-pill fw-bold" onClick={() => handleConfirm(order.id)}>
                        Xác nhận đơn
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button className="btn btn-primary flex-grow-1 rounded-pill fw-bold" onClick={() => handleAssign(order.id)}>
                        Bắt đầu làm
                      </button>
                    )}
                    {order.status === 'PREPARING' && !packedOrders.includes(order.id) && (
                      <button className="btn btn-success flex-grow-1 rounded-pill fw-bold" onClick={() => handlePacked(order.id)}>
                        Đã xong món <i className="fa-solid fa-check ms-1"></i>
                      </button>
                    )}
                    {order.status === 'PREPARING' && packedOrders.includes(order.id) && (
                      <button className="btn btn-info text-dark flex-grow-1 rounded-pill fw-bold" onClick={() => handleReadyForPickup(order.id)}>
                        Chuyển Shipper <i className="fa-solid fa-truck-fast ms-1"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="modal d-block" style={{background:"rgba(0,0,0,.5)", backdropFilter: "blur(4px)"}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Chi tiết đơn #{selectedOrder.id}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body">
                <div className="bg-light p-3 rounded-3 mb-3">
                  <p className="mb-1"><strong>Khách hàng:</strong> {selectedOrder.user?.userName || selectedOrder.recipientName || 'Chưa rõ'}</p>
                  <p className="mb-1"><strong>SĐT:</strong> {selectedOrder.phone || 'Chưa cung cấp'}</p>
                  <p className="mb-1"><strong>Địa chỉ giao:</strong> {selectedOrder.shippingAddress || selectedOrder.address || 'Tại quán'}</p>
                  {selectedOrder.note && <p className="mb-0 text-danger"><strong>Ghi chú:</strong> {selectedOrder.note}</p>}
                </div>
                <h6 className="fw-bold mb-3">Danh sách món:</h6>
                <div className="list-group list-group-flush mb-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div className="list-group-item px-0 d-flex justify-content-between align-items-center" key={idx}>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-danger rounded-pill me-3 fs-6">x{item.quantity}</span>
                        <div>
                          <p className="mb-0 fw-bold">{item.productNameSnapshot || item.product?.productName}</p>
                          <small className="text-muted">Kích cỡ: {item.size || 'Tiêu chuẩn'}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="d-flex justify-content-between align-items-center border-top pt-3">
                  <span className="fw-bold">Tổng thanh toán:</span>
                  <h4 className="text-danger fw-bold mb-0">{selectedOrder.total?.toLocaleString()} đ</h4>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setSelectedOrder(null)}>Đóng</button>
                {selectedOrder.status === 'PENDING_CONFIRMATION' && (
                  <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold" onClick={() => { handleConfirm(selectedOrder.id); setSelectedOrder(null); }}>
                    Xác nhận đơn
                  </button>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold" onClick={() => { handleAssign(selectedOrder.id); setSelectedOrder(null); }}>
                    Bắt đầu làm
                  </button>
                )}
                {selectedOrder.status === 'PREPARING' && !packedOrders.includes(selectedOrder.id) && (
                  <button type="button" className="btn btn-success rounded-pill px-4 fw-bold" onClick={() => { handlePacked(selectedOrder.id); setSelectedOrder(null); }}>
                    Đã xong món
                  </button>
                )}
                {selectedOrder.status === 'PREPARING' && packedOrders.includes(selectedOrder.id) && (
                  <button type="button" className="btn btn-info text-dark rounded-pill px-4 fw-bold" onClick={() => handleReadyForPickup(selectedOrder.id)}>
                    Chuyển Shipper
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
