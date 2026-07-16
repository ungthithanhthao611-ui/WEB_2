import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import axiosClient from "../../api/axiosClient";
import "./VnpayResultPage.css";

function VnpayResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txnRef = searchParams.get("txnRef");
  const resultQuery = searchParams.get("result");
  const [status, setStatus] = useState("PENDING");
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (!txnRef) {
      navigate("/orders");
      return;
    }

    if (resultQuery === "invalid-signature") {
      setStatus("FAILED");
      return;
    }

    let intervalId;
    let attempts = 0;
    const maxAttempts = 15; // Poll for 30 seconds max

    const checkStatus = async () => {
      try {
        const response = await axiosClient.get(`/api/payments/vnpay/status/${txnRef}`);
        const data = response.data;
        
        if (data.paymentStatus === "PAID" || data.paymentStatus === "FAILED" || data.paymentStatus === "EXPIRED") {
          setStatus(data.paymentStatus);
          setPaymentDetails(data);
          clearInterval(intervalId);
        } else if (attempts >= maxAttempts) {
          setStatus("TIMEOUT");
          clearInterval(intervalId);
        }
        attempts++;
      } catch (err) {
        console.error("Lỗi lấy trạng thái thanh toán", err);
        attempts++;
      }
    };

    checkStatus(); // Initial check
    intervalId = setInterval(checkStatus, 2000);

    return () => clearInterval(intervalId);
  }, [txnRef, resultQuery, navigate]);

  return (
    <UserLayout>
      <div className="vnpay-result-container container py-5 text-center">
        <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: "600px" }}>
          {status === "PENDING" && (
            <>
              <div className="spinner-border text-danger mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Đang xử lý...</span>
              </div>
              <h3>Đang xử lý thanh toán...</h3>
              <p className="text-muted">Vui lòng không đóng trình duyệt, hệ thống đang xác nhận với VNPAY.</p>
            </>
          )}

          {status === "PAID" && (
            <>
              <i className="fa-solid fa-circle-check text-success mb-3" style={{ fontSize: "4rem" }}></i>
              <h3 className="text-success">Thanh Toán Thành Công</h3>
              <p>Đơn hàng của bạn đã được thanh toán và đang chờ chuẩn bị.</p>
              {paymentDetails && (
                <div className="text-start bg-light p-3 rounded mb-4 mt-3">
                  <p className="mb-1"><strong>Mã giao dịch:</strong> {paymentDetails.txnRef}</p>
                  <p className="mb-1"><strong>Mã đơn hàng:</strong> {paymentDetails.orderId}</p>
                  <p className="mb-1"><strong>Số tiền:</strong> {(paymentDetails.amount).toLocaleString("vi-VN")} đ</p>
                </div>
              )}
              <Link to="/orders" className="btn btn-danger w-100">Xem lịch sử đơn hàng</Link>
            </>
          )}

          {status === "FAILED" && (
            <>
              <i className="fa-solid fa-circle-xmark text-danger mb-3" style={{ fontSize: "4rem" }}></i>
              <h3 className="text-danger">Thanh Toán Thất Bại</h3>
              <p>Rất tiếc, giao dịch của bạn không thể hoàn tất hoặc đã bị hủy.</p>
              <Link to="/orders" className="btn btn-outline-danger w-100">Về trang Đơn Hàng</Link>
            </>
          )}

          {status === "EXPIRED" && (
            <>
              <i className="fa-solid fa-clock text-warning mb-3" style={{ fontSize: "4rem" }}></i>
              <h3 className="text-warning">Giao Dịch Hết Hạn</h3>
              <p>Bạn đã không hoàn tất thanh toán trong thời gian quy định.</p>
              <Link to="/orders" className="btn btn-outline-danger w-100">Về trang Đơn Hàng</Link>
            </>
          )}

          {status === "TIMEOUT" && (
            <>
              <i className="fa-solid fa-triangle-exclamation text-warning mb-3" style={{ fontSize: "4rem" }}></i>
              <h3 className="text-warning">Chưa Nhận Được Phản Hồi</h3>
              <p>Hệ thống chưa nhận được kết quả từ VNPAY. Vui lòng kiểm tra lại trạng thái đơn hàng sau ít phút.</p>
              <Link to="/orders" className="btn btn-danger w-100">Xem Đơn Hàng</Link>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

export default VnpayResultPage;
