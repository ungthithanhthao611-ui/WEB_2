import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8900",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let cartId = sessionStorage.getItem("cartId");
  if (!cartId) {
    cartId = String(Math.floor(Math.random() * 1000000) + 1);
    sessionStorage.setItem("cartId", cartId);
  }
  config.headers["Cart-Id"] = cartId;

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;
