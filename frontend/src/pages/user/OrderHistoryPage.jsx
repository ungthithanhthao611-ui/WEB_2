import { useEffect, useState } from "react";
import { cancelOrder, getOrdersByUser } from "../../services/orderService";
import UserLayout from "../../layouts/UserLayout";
import { createComplaint } from "../../services/contentService";
import { showToast } from "../../services/shopConfigService";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complaintOrder, setComplaintOrder] = useState(null);
  const [reason, setReason] = useState("Sản phẩm bị hư hỏng");
  const [description, setDescription] = useState("");

  const statusSteps = ["PENDING_CONFIRMATION", "CONFIRMED", "PREPARING", "SHIPPING", "COMPLETED"];
  const statusLabels = ["Chờ xác nhận", "Đã xác nhận", "Đang chuẩn bị", "Đang giao", "Đã giao"];
  const statusText = { PENDING_CONFIRMATION:"Chờ xác nhận", CONFIRMED:"Đã xác nhận", PREPARING:"Đang chuẩn bị", SHIPPING:"Đang giao", COMPLETED:"Đã giao", CANCELLED:"Đã hủy", REJECTED:"Bị từ chối" };

  const submitComplaint = (event) => {
    event.preventDefault();
    createComplaint({ orderId: complaintOrder, reason, description, userId: sessionStorage.getItem("userId"), userName: sessionStorage.getItem("email") || "Khách hàng" });
    setComplaintOrder(null); setDescription("");
    alert("Đã gửi khiếu nại đến bộ phận hỗ trợ.");
  };

  const loadOrders = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await getOrdersByUser(userId);
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    const reason = window.prompt("Lý do hủy đơn:", "Tôi muốn thay đổi đơn hàng");
    if (!reason) return;
    try {
      const response = await cancelOrder(orderId, reason);
      setOrders((current) => current.map((order) => order.id === orderId ? response.data : order));
      showToast("Đã hủy đơn hàng");
    }
    catch (error) { showToast(error.response?.data?.message || "Không thể hủy đơn hàng", "error"); }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <UserLayout>
      <div className="container mt-4">
        <h2 className="fw-bold mb-4">Lịch Sử Mua Hàng</h2>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="alert alert-info text-center py-4 rounded-4">
            Bạn chưa thực hiện bất kỳ đơn hàng nào!
          </div>
        ) : (
          <div className="row g-3">
            {orders.map((o) => (
              <div className="col-12" key={o.id}>
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <span className="text-muted">Mã đơn hàng:</span> <span className="fw-bold">#{o.id}</span>
                    </div>
                    <div>
                      <span className="text-muted">Ngày đặt:</span> <span className="fw-semibold">{new Date(o.orderedDate || Date.now()).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                  <hr />
                  {!["CANCELLED","REJECTED"].includes(o.status) ? <div className="d-flex justify-content-between mb-4">
                    {statusSteps.map((step, index) => {
                      const current = Math.max(0, statusSteps.indexOf(o.status));
                      return <div className={`text-center flex-fill ${index <= current ? "text-danger fw-bold" : "text-muted"}`} key={step}><div className={`rounded-circle mx-auto mb-1 ${index <= current ? "bg-danger" : "bg-secondary"}`} style={{width:14,height:14}}></div><small>{statusLabels[index]}</small></div>;
                    })}
                  </div> : <div className={`alert ${o.status === "CANCELLED" ? "alert-secondary" : "alert-danger"} mb-4`}><i className="fa-solid fa-circle-xmark me-2"></i><b>{statusText[o.status]}</b>{o.cancellationReason && <span> · {o.cancellationReason}</span>}</div>}
                  <div className="row">
                    <div className="col-md-8">
                      <p className="mb-1"><span className="fw-semibold">Khách hàng:</span> {o.user ? o.user.userName : 'Không rõ'}</p>
                      <p className="mb-0">
                        <span className="fw-semibold">Sản phẩm: </span>
                        {o.items && o.items.length > 0 ? (
                          o.items.map(item => `${item.productNameSnapshot || item.product?.productName || 'Sản phẩm'}${item.size ? ` - Size ${item.size}` : ""} (x${item.quantity})`).join(", ")
                        ) : 'Không có sản phẩm'}
                      </p>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                      <p className="mb-1"><span className="fw-semibold">Trạng thái:</span> <span className={`badge ${o.status === "COMPLETED" ? "bg-success" : o.status === "CANCELLED" ? "bg-secondary" : o.status === "REJECTED" ? "bg-danger" : "bg-warning text-dark"} px-3 py-2 fs-6`}>{statusText[o.status] || o.status}</span></p>
                      <h4 className="text-primary fw-bold mb-0 mt-2">Tổng: {(o.total || 0).toLocaleString("vi-VN")} VNĐ</h4>
                      {o.status === "COMPLETED" && <button className="btn btn-outline-danger btn-sm mt-3" onClick={() => setComplaintOrder(o.id)}>Khiếu nại đơn hàng</button>}
                      {(["PENDING_CONFIRMATION","CONFIRMED"].includes(o.status)) && <button className="btn btn-outline-secondary btn-sm mt-3 ms-2" onClick={() => handleCancel(o.id)}>Hủy đơn</button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {complaintOrder && <div className="modal d-block" style={{background:"rgba(0,0,0,.45)"}}><div className="modal-dialog modal-dialog-centered"><form className="modal-content rounded-4" onSubmit={submitComplaint}><div className="modal-header"><h5>Khiếu nại đơn #{complaintOrder}</h5><button type="button" className="btn-close" onClick={() => setComplaintOrder(null)}></button></div><div className="modal-body"><select className="form-select mb-3" value={reason} onChange={(e)=>setReason(e.target.value)}><option>Sản phẩm bị hư hỏng</option><option>Giao sai sản phẩm</option><option>Thiếu sản phẩm</option><option>Giao hàng quá lâu</option><option>Khác</option></select><textarea className="form-control" rows="4" required placeholder="Mô tả chi tiết" value={description} onChange={(e)=>setDescription(e.target.value)}></textarea></div><div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => setComplaintOrder(null)}>Hủy</button><button className="btn btn-danger">Gửi khiếu nại</button></div></form></div></div>}
      </div>
    </UserLayout>
  );
}

export default OrderHistoryPage;
