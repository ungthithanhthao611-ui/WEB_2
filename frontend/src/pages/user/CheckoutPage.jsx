import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder, createVnpayPayment } from "../../services/orderService";
import { getCart } from "../../services/cartService";
import UserLayout from "../../layouts/UserLayout";
import { getCartMeta, getSavedVoucherCodes, getShippingConfig, showToast } from "../../services/shopConfigService";
import { fetchShippingConfig, fetchVouchers } from "../../services/commerceService";
import { getUserProfile } from "../../services/authService";
import "./CheckoutPage.css";

const districts = ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 7", "Quận 10", "Bình Thạnh", "Phú Nhuận", "Tân Bình", "Thủ Đức"];
const MOCK_STORES = {
  "Quận 1": ["Highlands Nguyễn Huệ - Quận 1", "Highlands Lê Lợi - Quận 1", "Highlands Pasteur - Quận 1"],
  "Quận 3": ["Highlands CMT8 - Quận 3", "Highlands Võ Văn Tần - Quận 3"],
  "Quận 4": ["Highlands Hoàng Diệu - Quận 4", "Highlands Khánh Hội - Quận 4"],
  "Quận 5": ["Highlands Nguyễn Trãi - Quận 5", "Highlands Trần Hưng Đạo - Quận 5"],
  "Quận 7": ["Highlands Nguyễn Thị Thập - Quận 7", "Highlands Crescent Mall - Quận 7"],
  "Quận 10": ["Highlands Sư Vạn Hạnh - Quận 10", "Highlands Vạn Hạnh Mall - Quận 10"],
  "Bình Thạnh": ["Highlands Landmark 81 - Bình Thạnh", "Highlands Phan Đăng Lưu - Bình Thạnh"],
  "Phú Nhuận": ["Highlands Phan Xích Long - Phú Nhuận", "Highlands Nguyễn Văn Trỗi - Phú Nhuận"],
  "Tân Bình": ["Highlands Cộng Hòa - Tân Bình", "Highlands Hoàng Văn Thụ - Tân Bình"],
  "Thủ Đức": ["Highlands Võ Văn Ngân - Thủ Đức", "Highlands Gigamall - Thủ Đức"]
};
const payments = [
  ["COD", "Thanh toán khi nhận hàng (COD)", "fa-money-bill-wave"],
  ["VNPAY", "Thanh toán bằng thẻ/Ví VNPAY", "fa-credit-card"]
];

function CheckoutPage() {
  const navigate = useNavigate();
  const [shippingConfig, setShippingConfig] = useState(() => getShippingConfig());
  const [cart, setCart] = useState([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: "", address: "", phone: "", note: "", paymentMethod: "COD", district: "Quận 1", store: "", shippingMethod: "" });

  useEffect(() => {
    const refresh = async () => {
      let config;
      try { const response = await fetchShippingConfig(); config = { stores: response.data.stores.map(store => store.name), methods: response.data.methods }; }
      catch { config = getShippingConfig(); }
      setShippingConfig(config);
      setForm((current) => ({
        ...current,
        store: config.stores?.includes(current.store) ? current.store : config.stores?.[0] || "",
        shippingMethod: config.methods.some((method) => method.id === current.shippingMethod) ? current.shippingMethod : config.methods[0]?.id || "",
      }));
    };
    refresh();
    getCart().then((response) => setCart(response.data || [])).catch(() => setCart([]));
    fetchVouchers().then(response => setVouchers(response.data || [])).catch(() => setVouchers([]));
    
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      getUserProfile(userId).then(res => {
        const user = res.data;
        if (user && user.userDetails) {
          const { firstName, lastName, phoneNumber, street, streetNumber, locality } = user.userDetails;
          setForm(current => {
            const next = { ...current };
            if (!next.name) next.name = `${firstName || ""} ${lastName || ""}`.trim();
            if (!next.phone) next.phone = phoneNumber || "";
            if (!next.address) next.address = street ? `${streetNumber ? streetNumber + " " : ""}${street}` : "";
            if (locality && districts.includes(locality)) next.district = locality;
            return next;
          });
        }
      }).catch(err => console.error("Lỗi lấy thông tin user:", err));
    }

    window.addEventListener("shipping-config-updated", refresh);
    return () => window.removeEventListener("shipping-config-updated", refresh);
  }, []);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "district") {
        const available = MOCK_STORES[value] || [`Highlands Trung Tâm - ${value}`];
        next.store = available[0];
      }
      return next;
    });
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const availableStores = useMemo(() => {
    return MOCK_STORES[form.district] || [`Highlands Trung Tâm - ${form.district}`];
  }, [form.district]);

  const cartMeta = getCartMeta();
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(cartMeta[item.product?.id]?.price || item.product?.price || 0) * Number(item.quantity || 0), 0), [cart, cartMeta]);
  const selectedShipping = shippingConfig.methods.find((method) => method.id === form.shippingMethod);
  const shippingFee = Number(selectedShipping?.fee || 0);
  const discount = appliedVoucher ? Math.min(appliedVoucher.type === "PERCENT" ? subtotal * appliedVoucher.value / 100 : appliedVoucher.value, appliedVoucher.maxDiscount || Infinity) : 0;
  const total = Math.max(0, subtotal + shippingFee - discount);
  const savedVouchers = vouchers.filter((voucher) => getSavedVoucherCodes().includes(voucher.code) && voucher.active);

  const applyVoucher = (code = voucherCode) => {
    const voucher = vouchers.find((item) => item.code === code.trim().toUpperCase() && item.active);
    if (!voucher) return showToast("Mã voucher không tồn tại hoặc đã tắt", "error");
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) return showToast("Voucher đã hết hạn", "error");
    if (subtotal < Number(voucher.minOrder || 0)) return showToast(`Đơn tối thiểu ${Number(voucher.minOrder).toLocaleString("vi-VN")}đ`, "error");
    setAppliedVoucher(voucher);
    setVoucherCode(voucher.code);
    showToast("Áp dụng voucher thành công");
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Vui lòng nhập họ tên người nhận.";
    if (!form.phone.trim()) next.phone = "Vui lòng nhập số điện thoại.";
    else if (!/^0\d{9}$/.test(form.phone.trim())) next.phone = "Số điện thoại phải gồm 10 số và bắt đầu bằng 0.";
    if (!form.address.trim()) next.address = "Vui lòng nhập số nhà và tên đường.";
    else if (form.address.trim().length < 5) next.address = "Địa chỉ quá ngắn, vui lòng nhập cụ thể hơn.";
    if (!form.district) next.district = "Vui lòng chọn quận/huyện.";
    if (!form.store) next.store = "Vui lòng chọn cửa hàng chuẩn bị đơn.";
    if (!form.shippingMethod) next.shippingMethod = "Vui lòng chọn hình thức giao hàng.";
    if (!form.paymentMethod) next.paymentMethod = "Vui lòng chọn phương thức thanh toán.";
    setErrors(next);
    const messages = Object.values(next);
    if (!messages.length) return true;
    const first = Object.keys(next)[0];
    document.querySelector(`[name="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast(`Vui lòng bổ sung: ${messages.join(" ")}`, "error");
    return false;
  };

  const checkout = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    if (!cart.length) return showToast("Giỏ hàng đang trống, vui lòng thêm sản phẩm trước.", "error");
    setLoading(true);
    try {
      const orderResponse = await createOrder(Number(sessionStorage.getItem("userId")), cart, { ...form, subtotal, shippingFee, discount, total, voucherCode: appliedVoucher?.code || "", cartMeta });
      const createdOrder = orderResponse.data;
      
      if (form.paymentMethod === "VNPAY") {
        const vnpayRes = await createVnpayPayment(createdOrder.id);
        if (vnpayRes.data && vnpayRes.data.paymentUrl) {
          window.location.href = vnpayRes.data.paymentUrl;
          return;
        }
      }
      
      showToast("Đặt hàng thành công");
      navigate("/orders");
    } catch (error) {
      console.error("Lỗi checkout:", error.response?.data || error);
      const fieldErrors = error.response?.data?.fields;
      if (fieldErrors) setErrors((current) => ({ ...current, ...fieldErrors }));
      showToast(error.response?.data?.message || error.response?.data?.detail || "Không thể tạo đơn hàng. Vui lòng thử lại.", "error");
    } finally { setLoading(false); }
  };

  const ErrorText = ({ field }) => errors[field] ? <div className="invalid-feedback d-block">{errors[field]}</div> : null;

  return <UserLayout><div className="checkout-page container py-4">
    <div className="checkout-heading"><div><span className="eyebrow">HIGHLANDS DELIVERY</span><h2>Hoàn tất đơn hàng</h2><p>Các mục có dấu <b className="text-danger">*</b> là bắt buộc</p></div><div className="secure-label"><i className="fa-solid fa-shield-halved"></i> Thanh toán an toàn</div></div>
    <form onSubmit={checkout} noValidate><div className="row g-4"><div className="col-lg-7">
      <section className="checkout-card"><h4><span>1</span>Thông tin nhận hàng</h4><div className="row g-3">
        <div className="col-md-6"><label>Người nhận <b className="text-danger">*</b></label><input name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A"/><ErrorText field="name"/></div>
        <div className="col-md-6"><label>Số điện thoại <b className="text-danger">*</b></label><input name="phone" className={`form-control ${errors.phone ? "is-invalid" : ""}`} value={form.phone} onChange={handleChange} placeholder="09xxxxxxxx" inputMode="numeric"/><ErrorText field="phone"/></div>
        <div className="col-12"><label>Số nhà, tên đường <b className="text-danger">*</b></label><input name="address" className={`form-control ${errors.address ? "is-invalid" : ""}`} value={form.address} onChange={handleChange} placeholder="Ví dụ: 123 Nguyễn Thị Minh Khai"/><ErrorText field="address"/></div>
        <div className="col-md-6"><label>Quận/Huyện <b className="text-danger">*</b></label><select name="district" className={`form-select ${errors.district ? "is-invalid" : ""}`} value={form.district} onChange={handleChange}>{districts.map((item) => <option key={item}>{item}</option>)}</select><ErrorText field="district"/></div>
        <div className="col-md-6"><label>Cửa hàng chuẩn bị đơn <b className="text-danger">*</b></label><select name="store" className={`form-select ${errors.store ? "is-invalid" : ""}`} value={form.store} onChange={handleChange}><option value="">-- Chọn cửa hàng --</option>{availableStores.map((item) => <option key={item}>{item}</option>)}</select><ErrorText field="store"/></div>
        <div className="col-12"><label>Ghi chú cho cửa hàng</label><textarea name="note" className="form-control" rows="2" value={form.note} onChange={handleChange} placeholder="Ít đá, ít đường, gọi trước khi giao..."/></div>
      </div></section>
      <section className={`checkout-card ${errors.shippingMethod ? "checkout-section-error" : ""}`}><h4><span>2</span>Chọn hình thức giao <b className="text-danger">*</b></h4><div className="shipping-grid">{shippingConfig.methods.map((method) => <label className={`shipping-option ${form.shippingMethod === method.id ? "selected" : ""}`} key={method.id}><input type="radio" name="shippingMethod" value={method.id} checked={form.shippingMethod === method.id} onChange={handleChange}/><div><b>{method.name}</b><small><i className="fa-regular fa-clock"></i> {method.eta}</small></div><strong>{Number(method.fee).toLocaleString("vi-VN")}đ</strong></label>)}</div><ErrorText field="shippingMethod"/></section>
      <section className={`checkout-card ${errors.paymentMethod ? "checkout-section-error" : ""}`}><h4><span>3</span>Phương thức thanh toán <b className="text-danger">*</b></h4><div className="payment-options">{payments.map(([id, label, icon]) => <label className={form.paymentMethod === id ? "selected" : ""} key={id}><input type="radio" name="paymentMethod" value={id} checked={form.paymentMethod === id} onChange={handleChange}/><i className={`fa-solid ${icon}`}></i><span>{label}</span></label>)}</div><ErrorText field="paymentMethod"/></section>
    </div><div className="col-lg-5"><aside className="checkout-summary"><h4>Đơn hàng của bạn</h4><div className="order-items">{cart.map((item) => <div className="order-item" key={item.product?.id}><div><b>{item.product?.productName}</b><small>Size {cartMeta[item.product?.id]?.size || "Tiêu chuẩn"} · x{item.quantity}</small></div><span>{(Number(cartMeta[item.product?.id]?.price || item.product?.price || 0) * item.quantity).toLocaleString("vi-VN")}đ</span></div>)}</div>
      <div className="voucher-box"><label><i className="fa-solid fa-ticket"></i> Voucher</label><div className="input-group"><input className="form-control text-uppercase" placeholder="Nhập mã giảm giá" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)}/><button type="button" className="btn btn-outline-danger" onClick={() => applyVoucher()}>Áp dụng</button></div>{savedVouchers.length > 0 && <div className="saved-vouchers"><small>Mã đã lưu:</small>{savedVouchers.map((voucher) => <button type="button" key={voucher.code} onClick={() => applyVoucher(voucher.code)}>{voucher.code}</button>)}</div>}{appliedVoucher && <div className="voucher-applied"><i className="fa-solid fa-circle-check"></i> {appliedVoucher.title}</div>}</div>
      <div className="price-lines"><div><span>Tạm tính</span><b>{subtotal.toLocaleString("vi-VN")}đ</b></div><div><span>Phí giao hàng</span><b>{shippingFee.toLocaleString("vi-VN")}đ</b></div>{discount > 0 && <div className="discount"><span>Voucher</span><b>-{discount.toLocaleString("vi-VN")}đ</b></div>}<div className="total"><span>Tổng thanh toán</span><b>{total.toLocaleString("vi-VN")}đ</b></div></div>
      <button className="btn-place-order" disabled={loading}>{loading ? "Đang xử lý..." : `Đặt hàng · ${total.toLocaleString("vi-VN")}đ`}</button><p className="terms"><i className="fa-solid fa-lock"></i> Thông tin của bạn được bảo mật</p>
    </aside></div></div></form>
  </div></UserLayout>;
}

export default CheckoutPage;
