import { useEffect, useState } from "react";
import { cancelOrder, getOrdersByUser, resolveOrderIssue } from "../../services/orderService";
import UserLayout from "../../layouts/UserLayout";
import { createComplaint } from "../../services/contentService";
import { showToast } from "../../services/shopConfigService";
import { saveRecommendation } from "../../services/recommendationService";
import { getProducts } from "../../services/productService";
import { Link } from "react-router-dom";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complaintOrder, setComplaintOrder] = useState(null);
  const [reason, setReason] = useState("Sản phẩm bị hư hỏng");
  const [description, setDescription] = useState("");
  const [trackingOrder, setTrackingOrder] = useState(null);

  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImageBase64, setReviewImageBase64] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const statusSteps = ["PENDING_CONFIRMATION", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "DELIVERING", "COMPLETED"];
  const statusLabels = ["Chờ xác nhận", "Xác nhận", "Đóng gói", "Chờ lấy", "Đang giao", "Đã giao"];
  const statusIcons = ["fa-file-invoice", "fa-check-double", "fa-kitchen-set", "fa-box", "fa-motorcycle", "fa-house-circle-check"];
  const statusText = { PENDING_CONFIRMATION:"Chờ xác nhận", CONFIRMED:"Đã xác nhận", PREPARING:"Đang chuẩn bị", READY_FOR_PICKUP:"Chờ lấy hàng", DELIVERING:"Đang giao", SHIPPING:"Đang giao", COMPLETED:"Đã giao", CANCELLED:"Đã hủy", REJECTED:"Bị từ chối", PENDING_USER_DECISION:"Chờ quyết định" };

  const submitComplaint = (event) => {
    event.preventDefault();
    createComplaint({ orderId: complaintOrder, reason, description, userId: sessionStorage.getItem("userId"), userName: sessionStorage.getItem("email") || "Khách hàng" });
    setComplaintOrder(null); setDescription("");
    showToast("Đã gửi khiếu nại đến bộ phận hỗ trợ.");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setReviewImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem("userId");
    if (!userId || !reviewProductId) return;

    setSubmittingReview(true);
    try {
      await saveRecommendation(userId, reviewProductId, reviewRating, reviewComment, reviewImageBase64);
      showToast("Gửi đánh giá thành công!");
      setReviewOrder(null);
      setReviewComment("");
      setReviewImageBase64("");
      setReviewRating(5);
    } catch (error) {
      console.error(error);
      showToast("Gửi đánh giá thất bại!", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("PROCESSING");

  const loadOrders = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await getOrdersByUser(userId);
      // Sort orders by ID descending (newest first)
      const sorted = (res.data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (error) {
      console.error("Lỗi lấy lịch sử đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy sản phẩm:", err);
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

  const handleResolveIssue = async (orderId, action) => {
    const userId = sessionStorage.getItem("userId");
    try {
      const response = await resolveOrderIssue(orderId, userId, action);
      setOrders((current) => current.map((order) => order.id === orderId ? response.data : order));
      if (action === "CONTINUE") {
        showToast("Đã xác nhận tiếp tục đơn hàng.");
      } else {
        showToast("Đã hủy đơn hàng thành công.");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Lỗi khi xử lý", "error");
    }
  };

  useEffect(() => {
    loadOrders();
    loadProducts();

    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    const eventSource = new EventSource(`http://localhost:8900/api/shop/order-stream/user/${userId}`);

    eventSource.addEventListener("ORDER_UPDATE", (event) => {
      try {
        const updatedOrder = JSON.parse(event.data);
        if (updatedOrder && updatedOrder.id) {
          setOrders((currentOrders) => {
            const exists = currentOrders.some(o => o.id === updatedOrder.id);
            if (exists) {
              return currentOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            } else {
              return [updatedOrder, ...currentOrders].sort((a, b) => b.id - a.id);
            }
          });
          showToast(`Đơn hàng #${updatedOrder.id} vừa được cập nhật trạng thái!`);
        }
      } catch (e) {
        console.error("Lỗi parse dữ liệu SSE:", e);
      }
    });

    eventSource.onerror = (err) => {
      console.error("Lỗi kết nối Real-time stream:", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (trackingOrder) {
      const timer = setTimeout(() => {
        const container = document.getElementById("tracking-map");
        if (container && window.L) {
          const coordinates = {
            "Quận 1": [10.7760, 106.7009],
            "Quận 3": [10.7792, 106.6800],
            "Quận 4": [10.7580, 106.7067],
            "Quận 5": [10.7540, 106.6634],
            "Quận 7": [10.7324, 106.7265],
            "Quận 10": [10.7719, 106.6679],
            "Bình Thạnh": [10.8106, 106.7091],
            "Phú Nhuận": [10.7992, 106.6803],
            "Tân Bình": [10.7930, 106.6556],
            "Thủ Đức": [10.8519, 106.7719]
          };

          const district = trackingOrder.district || "Quận 1";
          const customerCoords = coordinates[district] || [10.7760, 106.7009];
          const storeCoords = [customerCoords[0] - 0.005, customerCoords[1] - 0.006];

          // Initialize Leaflet Map
          const lMap = window.L.map("tracking-map").setView(storeCoords, 14);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(lMap);

          // Store Marker
          window.L.marker(storeCoords, {
            icon: window.L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#c82333; color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);'><i class='fa-solid fa-store'></i></div>",
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })
          }).addTo(lMap).bindPopup("Cửa hàng chuẩn bị đơn: " + (trackingOrder.store || "Highlands Coffee"));

          // Customer Marker
          window.L.marker(customerCoords, {
            icon: window.L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#28a745; color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);'><i class='fa-solid fa-house-user'></i></div>",
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })
          }).addTo(lMap).bindPopup("Nhà của bạn");

          // Routing Line
          const latlngs = [
            storeCoords,
            [storeCoords[0], customerCoords[1]],
            customerCoords
          ];
          window.L.polyline(latlngs, {color: '#007bff', weight: 4, dashArray: '5, 10'}).addTo(lMap);

          // Shipper Marker (moving)
          const shipperMarker = window.L.marker(storeCoords, {
            icon: window.L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#007bff; color:white; width:35px; height:35px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow: 0 0 10px rgba(0,123,255,0.8);'><i class='fa-solid fa-motorcycle fa-beat'></i></div>",
              iconSize: [35, 35],
              iconAnchor: [17, 17]
            })
          }).addTo(lMap).bindPopup("Shipper đang đi giao hàng...").openPopup();

          lMap.fitBounds([storeCoords, customerCoords], { padding: [30, 30] });

          // Animation simulation
          let step = 0;
          const totalSteps = 100;
          const interval = setInterval(() => {
            if (step <= totalSteps) {
              const t = step / totalSteps;
              let currentPos;
              if (t < 0.5) {
                const segmentT = t * 2;
                currentPos = [
                  storeCoords[0] + (storeCoords[0] - storeCoords[0]) * segmentT,
                  storeCoords[1] + (customerCoords[1] - storeCoords[1]) * segmentT
                ];
              } else {
                const segmentT = (t - 0.5) * 2;
                currentPos = [
                  storeCoords[0] + (customerCoords[0] - storeCoords[0]) * segmentT,
                  customerCoords[1] + (customerCoords[1] - customerCoords[1]) * segmentT
                ];
              }
              shipperMarker.setLatLng(currentPos);
              step++;
            } else {
              clearInterval(interval);
              shipperMarker.bindPopup("Shipper đã tới điểm giao!").openPopup();
            }
          }, 150);

          return () => clearInterval(interval);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [trackingOrder]);

  const getFilteredOrders = () => {
    if (activeTab === "ALL") return orders;
    if (activeTab === "PROCESSING") return orders.filter(o => ["PENDING_CONFIRMATION", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "DELIVERING", "SHIPPING", "PENDING_USER_DECISION"].includes(o.status));
    if (activeTab === "COMPLETED") return orders.filter(o => o.status === "COMPLETED");
    if (activeTab === "CANCELLED") return orders.filter(o => ["CANCELLED", "REJECTED"].includes(o.status));
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  return (
    <UserLayout>
      <div className="container mt-4 pb-5">
        <div className="d-flex align-items-center mb-4 gap-3">
          <Link to="/profile" className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px" }}>
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <h2 className="fw-bold mb-0">Lịch Sử Mua Hàng</h2>
        </div>

        <div className="card shadow-sm border-0 rounded-4 mb-4 p-2 bg-white">
          <ul className="nav nav-pills flex-nowrap overflow-auto" style={{whiteSpace: "nowrap"}}>
            <li className="nav-item">
              <button className={`nav-link rounded-pill fw-semibold px-4 py-2 ${activeTab === "PROCESSING" ? "active bg-danger text-white" : "text-dark"}`} onClick={() => setActiveTab("PROCESSING")}>Đơn mới đặt / Đang xử lý</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link rounded-pill fw-semibold px-4 py-2 ${activeTab === "COMPLETED" ? "active bg-danger text-white" : "text-dark"}`} onClick={() => setActiveTab("COMPLETED")}>Đã giao</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link rounded-pill fw-semibold px-4 py-2 ${activeTab === "CANCELLED" ? "active bg-danger text-white" : "text-dark"}`} onClick={() => setActiveTab("CANCELLED")}>Đã hủy</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link rounded-pill fw-semibold px-4 py-2 ${activeTab === "ALL" ? "active bg-danger text-white" : "text-dark"}`} onClick={() => setActiveTab("ALL")}>Tất cả</button>
            </li>
          </ul>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="alert alert-info text-center py-4 rounded-4">
            Không có đơn hàng nào trong mục này!
          </div>
        ) : (
          <div className="row g-4">
            {filteredOrders.map((o) => (
              <div className="col-12" key={o.id}>
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                  <div className="card-header bg-white p-4 border-bottom-0 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted">Mã đơn hàng:</span> <span className="fw-bold fs-5 text-dark">#{o.id}</span>
                    </div>
                    <div>
                      <span className="text-muted">Ngày đặt:</span> <span className="fw-semibold text-dark">{new Date(o.orderedDate || Date.now()).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                  <div className="card-body px-4 pb-2 pt-0">
                    {!["CANCELLED","REJECTED","PENDING_USER_DECISION"].includes(o.status) ? <div className="d-flex justify-content-between mb-5 mt-4 position-relative px-1 px-md-4">
                      <div className="position-absolute top-50 start-0 end-0 translate-middle-y d-none d-sm-block" style={{height: "3px", backgroundColor: "#e9ecef", zIndex: 0, left: "10%", right: "10%"}}></div>
                      {statusSteps.map((step, index) => {
                        const current = Math.max(0, statusSteps.indexOf(o.status));
                        const isActive = index <= current;
                        const isCurrent = index === current;
                        const isDelivering = step === "DELIVERING" && (o.status === "DELIVERING" || o.status === "SHIPPING");
                        
                        return (
                          <div className={`text-center position-relative bg-white px-1 ${isActive ? "text-danger" : "text-muted"}`} style={{zIndex: 1, flex: 1}} key={step}>
                            {isDelivering && (
                              <style>
                                {`
                                  @keyframes pulse-blue {
                                    0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); }
                                    70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
                                    100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
                                  }
                                  .shipper-pulsing {
                                    animation: pulse-blue 1.5s infinite;
                                    cursor: pointer !important;
                                    border: 3px solid #007bff !important;
                                    background-color: #007bff !important;
                                    color: white !important;
                                  }
                                `}
                              </style>
                            )}
                            <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center shadow-sm ${isActive ? (isDelivering ? "shipper-pulsing" : "bg-danger text-white") : "bg-light text-secondary"}`} 
                                 onClick={() => { if (isDelivering) setTrackingOrder(o); }}
                                 title={isDelivering ? "Bấm vào để định vị Shipper" : ""}
                                 style={{
                                   width: isCurrent ? "45px" : "35px", 
                                   height: isCurrent ? "45px" : "35px", 
                                   transition: "all 0.3s", 
                                   border: isActive ? (isDelivering ? "3px solid #007bff" : "3px solid #fff") : "none",
                                   cursor: isDelivering ? "pointer" : "default"
                                 }}>
                              <i className={`fa-solid ${isDelivering ? "fa-motorcycle fa-beat" : statusIcons[index]} ${isCurrent ? 'fs-5' : 'fs-6'}`}></i>
                            </div>
                            <small className={`d-block ${isActive ? "fw-bold" : ""} ${isCurrent ? "text-danger" : ""}`} style={{fontSize: "0.75rem", lineHeight: "1.2"}}>
                              {isDelivering ? "Định vị Shipper" : statusLabels[index]}
                            </small>
                          </div>
                        );
                      })}
                    </div> : 
                    o.status === "PENDING_USER_DECISION" ? (
                      <div className="alert alert-warning mb-4 mt-2 border-warning shadow-sm">
                        <div className="d-flex align-items-center mb-2">
                          <i className="fa-solid fa-circle-exclamation fs-4 me-2 text-warning"></i>
                          <b className="fs-5">Cửa hàng báo lỗi món</b>
                        </div>
                        <p className="mb-3">
                          Rất tiếc, cửa hàng đã báo lỗi đối với một món trong đơn hàng của bạn. Lý do: <strong>{o.problemReason || "Hết hàng hoặc lỗi sản phẩm"}</strong>.
                          <br />Bạn có muốn tiếp tục mua các món còn lại trong đơn, hay hủy toàn bộ đơn hàng này?
                        </p>
                        <div className="d-flex gap-2">
                          <button className="btn btn-warning fw-bold text-dark px-4 rounded-pill" onClick={() => handleResolveIssue(o.id, "CONTINUE")}>Đồng ý tiếp tục</button>
                          <button className="btn btn-outline-danger fw-bold px-4 rounded-pill bg-white" onClick={() => handleResolveIssue(o.id, "CANCEL")}>Hủy toàn bộ đơn</button>
                        </div>
                      </div>
                    ) :
                    <div className={`alert ${o.status === "CANCELLED" ? "alert-secondary" : "alert-danger"} mb-4 mt-2`}><i className="fa-solid fa-circle-xmark me-2"></i><b>{statusText[o.status]}</b>{o.cancellationReason && <span> · {o.cancellationReason}</span>}</div>}
                    
                    {!["COMPLETED", "CANCELLED", "REJECTED", "PENDING_USER_DECISION"].includes(o.status) && (
                      <div className="alert alert-info border-0 rounded-3 py-2 px-3 mb-4 d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: "#e8f4fd" }}>
                        <i className="fa-solid fa-clock text-primary"></i>
                        <span className="small text-dark">
                          Thời gian nhận hàng dự kiến: <strong>{o.shippingMethod === "express" ? "30 - 45 phút" : "60 - 90 phút"}</strong> kể từ khi đặt hàng thành công.
                        </span>
                      </div>
                    )}

                    <div className="row bg-light rounded-4 p-3 mx-0 mb-3">
                      <div className="col-md-8 mb-3 mb-md-0 border-end">
                        <p className="mb-3"><span className="fw-semibold text-muted">Khách hàng:</span> <span className="fw-bold">{o.user ? o.user.userName : 'Không rõ'}</span></p>
                        {o.paymentMethod && <p className="mb-3"><span className="fw-semibold text-muted">Thanh toán:</span> <span className="fw-bold">{o.paymentMethod === 'VNPAY' ? `VNPAY (${o.paymentStatus === 'PAID' ? 'Đã thanh toán' : o.paymentStatus})` : 'Thanh toán khi nhận hàng'}</span></p>}
                        <div>
                          <span className="fw-semibold text-muted d-block mb-2">Sản phẩm:</span>
                          {o.items && o.items.length > 0 ? (
                            <div className="d-flex flex-column gap-3 mt-1">
                              {o.items.map((item, index) => {
                                const pid = item.sourceProductId || item.product?.id;
                                const prodInfo = products.find(p => p.id === pid);
                                const imgUrl = prodInfo?.imageUrl || "https://via.placeholder.com/60?text=SP";
                                return (
                                  <div className="d-flex align-items-center" key={`${pid}-${index}`}>
                                    <div className="rounded border bg-white p-1 shadow-sm me-3" style={{width: '60px', height: '60px'}}>
                                      <img src={imgUrl} alt="product" className="w-100 h-100 rounded object-fit-cover" />
                                    </div>
                                    <div className="d-flex flex-column justify-content-center">
                                      <p className="mb-0 fw-bold text-dark lh-sm">{item.productNameSnapshot || item.product?.productName || 'Sản phẩm'}</p>
                                      <small className="text-muted mt-1">{item.size ? `Size ${item.size}` : "Tiêu chuẩn"} · <span className="fw-semibold">x{item.quantity}</span></small>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : <span className="text-muted">Không có sản phẩm</span>}
                        </div>
                      </div>
                      <div className="col-md-4 d-flex flex-column justify-content-center text-md-end ps-md-4 mt-3 mt-md-0">
                        <p className="mb-2"><span className="fw-semibold text-muted me-2">Trạng thái:</span> <span className={`badge ${o.status === "COMPLETED" ? "bg-success" : o.status === "CANCELLED" ? "bg-secondary" : o.status === "REJECTED" ? "bg-danger" : "bg-warning text-dark"} px-3 py-2 fs-6 rounded-pill shadow-sm`}>{statusText[o.status] || o.status}</span></p>
                        <h3 className="text-danger fw-bold mb-0 mt-3">{(o.total || 0).toLocaleString("vi-VN")} đ</h3>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-white p-4 border-top-0 d-flex justify-content-end gap-2">
                    {o.status === "COMPLETED" && (
                      <>
                        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setComplaintOrder(o.id)}>Khiếu nại</button>
                        <button className="btn btn-danger rounded-pill px-4 shadow-sm" onClick={() => {
                          setReviewOrder(o.id);
                          setReviewProductId(o.items?.[0]?.sourceProductId || o.items?.[0]?.product?.id);
                        }}>Đánh giá</button>
                      </>
                    )}
                    {(["PENDING_CONFIRMATION","CONFIRMED"].includes(o.status)) && <button className="btn btn-outline-danger rounded-pill px-4" onClick={() => handleCancel(o.id)}>Hủy đơn</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal Khiếu Nại */}
        {complaintOrder && <div className="modal d-block" style={{background:"rgba(0,0,0,.45)"}}><div className="modal-dialog modal-dialog-centered"><form className="modal-content rounded-4" onSubmit={submitComplaint}><div className="modal-header"><h5>Khiếu nại đơn #{complaintOrder}</h5><button type="button" className="btn-close" onClick={() => setComplaintOrder(null)}></button></div><div className="modal-body"><select className="form-select mb-3" value={reason} onChange={(e)=>setReason(e.target.value)}><option>Sản phẩm bị hư hỏng</option><option>Giao sai sản phẩm</option><option>Thiếu sản phẩm</option><option>Giao hàng quá lâu</option><option>Khác</option></select><textarea className="form-control" rows="4" required placeholder="Mô tả chi tiết" value={description} onChange={(e)=>setDescription(e.target.value)}></textarea></div><div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => setComplaintOrder(null)}>Hủy</button><button className="btn btn-danger">Gửi khiếu nại</button></div></form></div></div>}

        {/* Modal Đánh Giá */}
        {reviewOrder && (
          <div className="modal d-block" style={{background:"rgba(0,0,0,.45)"}}>
            <div className="modal-dialog modal-dialog-centered">
              <form className="modal-content rounded-4" onSubmit={submitReview}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Đánh giá sản phẩm</h5>
                  <button type="button" className="btn-close" onClick={() => setReviewOrder(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Chọn sản phẩm trong đơn</label>
                    <select className="form-select" value={reviewProductId || ""} onChange={(e) => setReviewProductId(Number(e.target.value))} required>
                      {orders.find(o => o.id === reviewOrder)?.items?.map((item, index) => (
                        <option key={`${item.sourceProductId || item.product?.id}-${index}`} value={item.sourceProductId || item.product?.id}>
                          {item.productNameSnapshot || item.product?.productName || 'Sản phẩm'} {item.size ? `- Size ${item.size}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Chất lượng</label>
                    <select className="form-select" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                      <option value="5">5 Sao - Tuyệt vời</option>
                      <option value="4">4 Sao - Rất tốt</option>
                      <option value="3">3 Sao - Bình thường</option>
                      <option value="2">2 Sao - Tạm được</option>
                      <option value="1">1 Sao - Không hài lòng</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bình luận</label>
                    <textarea className="form-control" rows="3" placeholder="Hãy chia sẻ cảm nhận của bạn nhé..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} required></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Đính kèm ảnh</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
                    {reviewImageBase64 && (
                      <div className="mt-2 text-center">
                        <img src={reviewImageBase64} alt="Preview" className="img-thumbnail" style={{ height: "100px" }} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setReviewOrder(null)}>Hủy</button>
                  <button type="submit" className="btn btn-danger" disabled={submittingReview}>
                    {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Định vị Shipper */}
        {trackingOrder && (
          <div className="modal d-block" style={{background:"rgba(0,0,0,.5)", backdropFilter: "blur(4px)", zIndex: 1050}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom-0 pb-0 bg-light rounded-top-4">
                  <h5 className="modal-title fw-bold text-danger"><i className="fa-solid fa-motorcycle me-2 fa-bounce"></i> Trình theo dõi Shipper (Mô phỏng)</h5>
                  <button type="button" className="btn-close" onClick={() => setTrackingOrder(null)}></button>
                </div>
                <div className="modal-body pt-4">
                  <div className="text-center mb-3">
                    <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-bold">
                      <i className="fa-solid fa-spinner fa-spin me-2"></i> Shipper đang giao hàng
                    </span>
                    <p className="text-muted mt-2 small">Đơn hàng #{trackingOrder.id} · Dự kiến giao tới trong 15 phút</p>
                  </div>
                  
                  <div className="mb-3">
                    <div id="tracking-map" style={{ height: "250px", borderRadius: "12px", border: "1px solid #ddd", zIndex: 1 }}></div>
                  </div>

                  <div className="border rounded-4 p-3 bg-light-subtle">
                    <p className="mb-2 small"><i className="fa-solid fa-location-dot me-2 text-danger"></i> <strong>Điểm giao hàng:</strong> {trackingOrder.deliveryAddress || trackingOrder.address}</p>
                    <p className="mb-0 small"><i className="fa-solid fa-store me-2 text-warning"></i> <strong>Cửa hàng chuẩn bị:</strong> {trackingOrder.store || "Highlands Coffee"}</p>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-danger rounded-pill px-4" onClick={() => setTrackingOrder(null)}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </UserLayout>
  );
}

export default OrderHistoryPage;
