import axiosClient from "../api/axiosClient";
import { clearCart } from "./cartService";
import { clearCartMeta } from "./shopConfigService";

const orderRequestKey = () => {
  const current = sessionStorage.getItem("checkoutIdempotencyKey");
  if (current) return current;
  const created = crypto.randomUUID();
  sessionStorage.setItem("checkoutIdempotencyKey", created);
  return created;
};

export const createOrder = async (userId, cartSnapshot = [], checkoutDetails = {}) => {
  if (!userId) throw new Error("USER_REQUIRED");
  if (!cartSnapshot.length) throw new Error("EMPTY_CART");
  const cartMeta = checkoutDetails.cartMeta || {};
  const payload = {
    userId: Number(userId), recipientName: checkoutDetails.name?.trim(),
    phone: checkoutDetails.phone?.trim(), address: checkoutDetails.address?.trim(),
    district: checkoutDetails.district, store: checkoutDetails.store,
    shippingMethod: checkoutDetails.shippingMethod, paymentMethod: checkoutDetails.paymentMethod,
    note: checkoutDetails.note?.trim() || "", voucherCode: checkoutDetails.voucherCode || "",
    shippingFee: Number(checkoutDetails.shippingFee || 0), discount: Number(checkoutDetails.discount || 0),
    items: cartSnapshot.map((item) => {
      const productId = item.product?.id;
      const meta = cartMeta[productId] || {};
      return { productId, productName: item.product?.productName || item.product?.name || "Sản phẩm",
        size: meta.size || "Tiêu chuẩn", sku: meta.sku || "",
        unitPrice: Number(meta.price || item.product?.price || 0), quantity: Number(item.quantity || 1) };
    }),
  };
  const response = await axiosClient.post("/api/shop/orders/checkout", payload, { headers: { "Idempotency-Key": orderRequestKey() } });
  await clearCart();
  clearCartMeta();
  sessionStorage.removeItem("checkoutIdempotencyKey");
  window.dispatchEvent(new Event("cart-updated"));
  return response;
};

export const getOrdersByUser = (userId) => axiosClient.get(`/api/shop/order/user/${userId}`);
export const getAllOrders = () => axiosClient.get("/api/shop/order");
export const getOrderDashboard = () => axiosClient.get("/api/shop/order/dashboard");
export const updateOrderStatus = (orderId, status, reason = "") => axiosClient.put(`/api/shop/order/${orderId}/status`, {
  status, reason, changedBy: sessionStorage.getItem("email") || "ADMIN",
});
export const cancelOrder = (orderId, reason) => axiosClient.put(`/api/shop/order/${orderId}/cancel`, {
  userId: sessionStorage.getItem("userId"), reason,
});

export const checkActiveProduct = (productId) => axiosClient.get(`/api/shop/order/active-product-check/${productId}`);
export const getPendingOrderCount = () => axiosClient.get("/api/shop/order/pending-count");
export const removeOrderItemAdmin = async (orderId, itemId, reason) => {
  return axiosClient.delete(`/api/shop/order/admin/${orderId}/items/${itemId}`, { params: { reason } });
};

export const resolveOrderIssue = async (orderId, userId, action) => {
  return axiosClient.post(`/api/shop/order/user/${orderId}/resolve-issue`, null, {
    params: { userId, action }
  });
};

export const assignOrderToStaff = (orderId, staffId) => axiosClient.put(`/api/shop/order/${orderId}/staff/assign`, { staffId });
export const assignOrderToShipper = (orderId, shipperId) => axiosClient.put(`/api/shop/order/${orderId}/shipper/assign`, { shipperId });
