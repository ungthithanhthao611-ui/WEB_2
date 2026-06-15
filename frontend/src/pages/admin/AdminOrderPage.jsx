import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/orderService";
import AdminLayout from "../../layouts/AdminLayout";
import { showToast } from "../../services/shopConfigService";

const STATUS_FLOW = ["PENDING_CONFIRMATION", "CONFIRMED", "PREPARING", "SHIPPING", "COMPLETED"];
const normalizeStatus = (status) => ({ PENDING:"PENDING_CONFIRMATION", PROCESSING:"PREPARING", DELIVERING:"SHIPPING" }[status] || status);
const STATUS_TEXT = { PENDING_CONFIRMATION:"Chờ xác nhận", CONFIRMED:"Đã xác nhận", PREPARING:"Đang chuẩn bị", SHIPPING:"Đang giao", COMPLETED:"Đã giao", CANCELLED:"Đã hủy", REJECTED:"Bị từ chối" };

function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const normalized = normalizeStatus(currentStatus);
    const currentIndex = STATUS_FLOW.indexOf(normalized);
    if (currentIndex < 0) return showToast(`Trạng thái ${currentStatus} không hợp lệ`, "error");
    if (currentIndex === STATUS_FLOW.length - 1) return showToast("Đơn hàng đã hoàn tất", "error");
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    try {
      await updateOrderStatus(orderId, nextStatus);
      showToast(`Đã cập nhật đơn hàng sang trạng thái: ${nextStatus}`);
      await loadOrders();
      setSelectedOrder((current) => current?.id === orderId ? { ...current, status: nextStatus } : current);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || error.response?.data?.detail || "Cập nhật trạng thái thất bại!", "error");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h2 className="fw-bold mb-4">Quản Lý Đơn Hàng</h2>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center my-4 p-4 text-muted">Chưa có đơn hàng nào được đặt.</div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Mã ĐH</th>
                  <th className="py-3">Khách hàng</th>
                  <th className="py-3">Chi tiết sản phẩm</th>
                  <th className="py-3">Tổng tiền</th>
                  <th className="py-3">Trạng thái</th>
                  <th className="py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 fw-bold">#{o.id}</td>
                    <td className="py-3">{o.user ? o.user.userName : 'Không rõ'}</td>
                    <td className="py-3">
                      {o.items && o.items.length > 0 ? (
                        o.items.map(item => `${item.productNameSnapshot || item.product?.productName || 'Sản phẩm'}${item.size ? ` - Size ${item.size}` : ""} (x${item.quantity})`).join(", ")
                      ) : 'Không có sản phẩm'}
                    </td>
                    <td className="py-3 text-primary fw-semibold">{(o.total || 0).toLocaleString("vi-VN")} VNĐ</td>
                    <td className="py-3">
                      <span className={`badge ${o.status === "COMPLETED" ? "bg-success" : o.status === "CANCELLED" ? "bg-secondary" : o.status === "REJECTED" ? "bg-danger" : "bg-warning text-dark"} px-3 py-2 fs-6`}>
                        {STATUS_TEXT[normalizeStatus(o.status)] || o.status}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button className="btn btn-outline-secondary btn-sm rounded-3 px-3 me-2" onClick={() => setSelectedOrder(o)}>
                        <i className="fa-solid fa-eye me-1"></i> Chi tiết
                      </button>
                      <button
                        className={`btn ${o.status === 'PENDING_CONFIRMATION' ? 'btn-success' : 'btn-outline-warning'} btn-sm rounded-3 px-3`}
                        disabled={["COMPLETED","CANCELLED","REJECTED"].includes(normalizeStatus(o.status))}
                        onClick={() => handleUpdateStatus(o.id, o.status)}
                      >
                        <i className="fa-solid fa-truck-fast me-1"></i> Cập nhật bước tiếp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {selectedOrder && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor:"rgba(0,0,0,.55)"}} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null); }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div className="modal-header px-4 py-3"><div><h4 className="modal-title fw-bold mb-1">Chi tiết đơn {selectedOrder.orderCode || `#${selectedOrder.id}`}</h4><small className="text-muted">Ngày đặt: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN") : selectedOrder.orderedDate}</small></div><button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button></div>
                <div className="modal-body p-4"><div className="row g-4">
                  <div className="col-lg-6"><section className="card border-0 bg-light rounded-4 p-4 h-100"><h5 className="fw-bold mb-3"><i className="fa-solid fa-user me-2 text-danger"></i>Thông tin khách hàng</h5><div className="row g-3"><div className="col-sm-6"><small className="text-muted d-block">Họ tên người nhận</small><b>{selectedOrder.recipientName || "-"}</b></div><div className="col-sm-6"><small className="text-muted d-block">Tài khoản</small><b>{selectedOrder.user?.userName || "-"}</b></div><div className="col-sm-6"><small className="text-muted d-block">Số điện thoại</small><b>{selectedOrder.phone || "-"}</b></div><div className="col-sm-6"><small className="text-muted d-block">Quận/Huyện</small><b>{selectedOrder.district || "-"}</b></div><div className="col-12"><small className="text-muted d-block">Địa chỉ giao hàng</small><b>{selectedOrder.deliveryAddress || "-"}</b></div><div className="col-12"><small className="text-muted d-block">Ghi chú</small><span>{selectedOrder.note || "Không có ghi chú"}</span></div></div></section></div>
                  <div className="col-lg-6"><section className="card border-0 bg-light rounded-4 p-4 h-100"><h5 className="fw-bold mb-3"><i className="fa-solid fa-truck me-2 text-danger"></i>Giao hàng & thanh toán</h5><div className="row g-3"><div className="col-sm-6"><small className="text-muted d-block">Cửa hàng</small><b>{selectedOrder.store || "-"}</b></div><div className="col-sm-6"><small className="text-muted d-block">Hình thức giao</small><b>{selectedOrder.shippingMethod || "-"}</b></div><div className="col-sm-6"><small className="text-muted d-block">Thanh toán</small><b>{selectedOrder.paymentMethod || "-"}</b></div><div className="col-sm-6"><small className="text-muted d-block">Trạng thái thanh toán</small><b>{selectedOrder.paymentStatus || "-"}</b></div><div className="col-sm-6"><small className="text-muted d-block">Trạng thái đơn</small><span className="badge bg-warning text-dark">{selectedOrder.status}</span></div><div className="col-sm-6"><small className="text-muted d-block">Voucher</small><b>{selectedOrder.voucherCode || "Không sử dụng"}</b></div></div></section></div>
                  <div className="col-12"><section className="card border rounded-4 overflow-hidden"><div className="p-3 border-bottom"><h5 className="fw-bold mb-0"><i className="fa-solid fa-bag-shopping me-2 text-danger"></i>Sản phẩm trong đơn</h5></div><div className="table-responsive"><table className="table align-middle mb-0"><thead className="table-light"><tr><th className="ps-4">Sản phẩm</th><th>Size / SKU</th><th className="text-end">Đơn giá</th><th className="text-center">SL</th><th className="text-end pe-4">Thành tiền</th></tr></thead><tbody>{(selectedOrder.items || []).map((item,index) => <tr key={`${item.sku || item.sourceProductId}-${index}`}><td className="ps-4 fw-semibold">{item.productNameSnapshot || item.product?.productName || "Sản phẩm"}</td><td><span className="badge bg-light text-dark border">Size {item.size || "Tiêu chuẩn"}</span><small className="d-block text-muted mt-1">{item.sku || "Không có SKU"}</small></td><td className="text-end">{Number(item.unitPrice || 0).toLocaleString("vi-VN")}đ</td><td className="text-center">{item.quantity}</td><td className="text-end pe-4 fw-bold">{Number(item.subTotal || item.unitPrice * item.quantity || 0).toLocaleString("vi-VN")}đ</td></tr>)}</tbody></table></div></section></div>
                  <div className="col-lg-5 ms-auto"><div className="card border-0 bg-light rounded-4 p-4"><div className="d-flex justify-content-between mb-2"><span>Tạm tính</span><b>{Number(selectedOrder.subtotal || 0).toLocaleString("vi-VN")}đ</b></div><div className="d-flex justify-content-between mb-2"><span>Phí giao hàng</span><b>{Number(selectedOrder.shippingFee || 0).toLocaleString("vi-VN")}đ</b></div><div className="d-flex justify-content-between mb-3 text-success"><span>Giảm giá</span><b>-{Number(selectedOrder.discount || 0).toLocaleString("vi-VN")}đ</b></div><div className="d-flex justify-content-between border-top pt-3 fs-5"><span className="fw-bold">Tổng cộng</span><b className="text-danger">{Number(selectedOrder.total || 0).toLocaleString("vi-VN")}đ</b></div></div></div>
                </div></div>
                <div className="modal-footer px-4"><button className="btn btn-light" onClick={() => setSelectedOrder(null)}>Đóng</button>{!["COMPLETED","CANCELLED","REJECTED"].includes(selectedOrder.status) && <button className="btn btn-danger" onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status)}><i className="fa-solid fa-truck-fast me-2"></i>Cập nhật bước tiếp</button>}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminOrderPage;
