import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/orderService";
import AdminLayout from "../../layouts/AdminLayout";

function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const nextStatus = currentStatus === "PAYMENT_EXPECTED" ? "COMPLETED" : "PAYMENT_EXPECTED";
    try {
      await updateOrderStatus(orderId, nextStatus);
      alert(`Đã cập nhật đơn hàng sang trạng thái: ${nextStatus}`);
      loadOrders();
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại!");
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
                        o.items.map(item => `${item.product ? item.product.productName : 'Sản phẩm'} (x${item.quantity})`).join(", ")
                      ) : 'Không có sản phẩm'}
                    </td>
                    <td className="py-3 text-primary fw-semibold">{(o.total || 0).toLocaleString("vi-VN")} VNĐ</td>
                    <td className="py-3">
                      <span className={`badge ${o.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'} px-3 py-2 fs-6`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        className={`btn ${o.status === 'PAYMENT_EXPECTED' ? 'btn-success' : 'btn-outline-warning'} btn-sm rounded-3 px-3`}
                        onClick={() => handleUpdateStatus(o.id, o.status)}
                      >
                        {o.status === "PAYMENT_EXPECTED" ? (
                          <>
                            <i className="fa-solid fa-circle-check"></i> Hoàn thành
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-rotate-left"></i> Chờ thanh toán
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOrderPage;
