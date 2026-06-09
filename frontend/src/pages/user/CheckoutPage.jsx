import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../services/orderService";
import UserLayout from "../../layouts/UserLayout";

function CheckoutPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    address: "",
    phone: "",
    paymentMethod: "COD",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userId = sessionStorage.getItem("userId");

    try {
      await createOrder(Number(userId));
      alert("Đặt hàng đồ chơi thành công! Đơn hàng của bạn đang được đóng gói gửi cho bé.");
      navigate("/orders");
    } catch (error) {
      alert("Đặt hàng thất bại!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="container mt-4" style={{ maxWidth: "600px" }}>
        <div className="card shadow-sm border-0 rounded-5 p-4 bg-white">
          <h3 className="fw-extrabold text-danger mb-4 text-center">THANH TOÁN ĐƠN HÀNG ĐỒ CHƠI</h3>

          <form onSubmit={handleCheckout}>
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Địa chỉ nhận hàng của bé</label>
              <input
                name="address"
                type="text"
                className="form-control form-toy-control rounded-3"
                placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Số điện thoại phụ huynh</label>
              <input
                name="phone"
                type="tel"
                className="form-control form-toy-control rounded-3"
                placeholder="09xxxxxxxx"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-dark">Phương thức thanh toán</label>
              <select
                name="paymentMethod"
                className="form-select form-toy-control rounded-3"
                value={form.paymentMethod}
                onChange={handleChange}
              >
                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                <option value="BANKING">Chuyển khoản Ngân hàng (Giả lập qua Kafka)</option>
                <option value="VNPAY">Ví điện tử VNPay (Giả lập)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-toy-primary w-100 py-3 rounded-pill fw-bold fs-6 text-white"
              disabled={loading}
            >
              {loading ? "Đang tạo đơn hàng..." : "XÁC NHẬN ĐẶT HÀNG NGAY"}
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}

export default CheckoutPage;
