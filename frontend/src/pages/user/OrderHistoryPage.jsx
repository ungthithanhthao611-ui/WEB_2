import { useEffect, useState } from "react";
import { getOrdersByUser } from "../../services/orderService";
import UserLayout from "../../layouts/UserLayout";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
                  <div className="row">
                    <div className="col-md-8">
                      <p className="mb-1"><span className="fw-semibold">Khách hàng:</span> {o.user ? o.user.userName : 'Không rõ'}</p>
                      <p className="mb-0">
                        <span className="fw-semibold">Sản phẩm: </span>
                        {o.items && o.items.length > 0 ? (
                          o.items.map(item => `${item.product ? item.product.productName : 'Sản phẩm'} (x${item.quantity})`).join(", ")
                        ) : 'Không có sản phẩm'}
                      </p>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                      <p className="mb-1"><span className="fw-semibold">Trạng thái:</span> <span className={`badge ${o.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'} px-3 py-2 fs-6`}>{o.status}</span></p>
                      <h4 className="text-primary fw-bold mb-0 mt-2">Tổng: {(o.total || 0).toLocaleString("vi-VN")} VNĐ</h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default OrderHistoryPage;
