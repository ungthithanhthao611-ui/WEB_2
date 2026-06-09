import axiosClient from "../api/axiosClient";

export const getCart = async () => {
  return axiosClient.get("/api/shop/cart");
};

export const addToCart = async (productId, quantity = 1) => {
  return axiosClient.post(`/api/shop/cart?productId=${productId}&quantity=${quantity}`);
};

export const removeCartItem = async (productId) => {
  return axiosClient.delete(`/api/shop/cart?productId=${productId}`);
};

export const clearCart = async () => {
  // order-service không có api clear cart trực tiếp bên ngoài, ta có thể tự động xóa hoặc bỏ qua
  return Promise.resolve();
};
