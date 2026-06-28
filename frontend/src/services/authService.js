import axiosClient from "../api/axiosClient";

export const login = async (data) => {
  return axiosClient.post("/api/accounts/api/auth/login", {
    username: data.username,
    password: data.password
  });
};

export const register = async (data) => {
  const parts = data.fullName.trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  return axiosClient.post("/api/accounts/registration", {
    userName: data.username,
    userPassword: data.password,
    userDetails: {
      firstName: firstName,
      lastName: lastName,
      email: data.email
    }
  });
};

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("email");
  sessionStorage.removeItem("cartId");
  window.dispatchEvent(new Event("cart-updated"));
};

export const getUserProfile = async (userId) => {
  return axiosClient.get(`/api/accounts/users/${userId}`);
};

export const forgotPassword = async (email) => {
  return axiosClient.post("/api/accounts/api/auth/forgot-password", { email });
};

export const resetPassword = async (email, otp, newPassword) => {
  return axiosClient.post("/api/accounts/api/auth/reset-password", { email, otp, newPassword });
};

export const getAllUsers = async () => {
  return axiosClient.get("/api/accounts/users");
};

export const deleteUser = async (userId) => {
  return axiosClient.delete(`/api/accounts/users/${userId}`);
};

export const getWishlist = async (userId) => {
  return axiosClient.get(`/api/accounts/users/${userId}/wishlist`);
};

export const addToWishlist = async (userId, productId) => {
  return axiosClient.post(`/api/accounts/users/${userId}/wishlist/${productId}`);
};

export const removeFromWishlist = async (userId, productId) => {
  return axiosClient.delete(`/api/accounts/users/${userId}/wishlist/${productId}`);
};

// Notifications
export const getUserNotifications = (userId) => {
  return axiosClient.get(`/api/accounts/api/notifications/user/${userId}`);
};

export const getUnreadNotificationCount = (userId) => {
  return axiosClient.get(`/api/accounts/api/notifications/user/${userId}/unread-count`);
};

export const createNotification = (data) => {
  return axiosClient.post(`/api/accounts/api/notifications`, data);
};

export const markNotificationRead = (notificationId) => {
  return axiosClient.put(`/api/accounts/api/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = (userId) => {
  return axiosClient.put(`/api/accounts/api/notifications/user/${userId}/read-all`);
};
