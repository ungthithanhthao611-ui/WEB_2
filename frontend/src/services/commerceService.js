import axiosClient from "../api/axiosClient";

export const fetchVouchers = (admin = false) => axiosClient.get(`/api/shop/${admin ? "admin/" : ""}vouchers`);
export const createVoucherApi = (voucher) => axiosClient.post("/api/shop/admin/vouchers", voucher);
export const updateVoucherApi = (id, voucher) => axiosClient.put(`/api/shop/admin/vouchers/${id}`, voucher);
export const deleteVoucherApi = (id) => axiosClient.delete(`/api/shop/admin/vouchers/${id}`);

const absoluteMedia = (url) => url?.startsWith("/api/") ? `http://localhost:8900${url}` : url;
export const fetchBanners = async (admin = false) => {
  const response = await axiosClient.get(`/api/shop/${admin ? "admin/" : ""}banners`);
  return { ...response, data: response.data.map(item => ({ ...item, imageUrl: absoluteMedia(item.imageUrl) })) };
};
export const saveBannerApi = (banner) => banner.id
  ? axiosClient.put(`/api/shop/admin/banners/${banner.id}`, banner)
  : axiosClient.post("/api/shop/admin/banners", banner);
export const deleteBannerApi = (id) => axiosClient.delete(`/api/shop/admin/banners/${id}`);
export const uploadBannerApi = (file) => {
  const data = new FormData(); data.append("file", file);
  return axiosClient.post("/api/shop/admin/banners/upload", data, { headers: { "Content-Type": undefined } })
    .then(response => ({ ...response, data: { ...response.data, url: absoluteMedia(response.data.url) } }));
};

export const createSupportRequestApi = (ticket) => axiosClient.post("/api/shop/support", ticket);
export const fetchSupportRequests = () => axiosClient.get("/api/shop/admin/support");
export const fetchUserSupportRequests = (userId) => axiosClient.get(`/api/shop/support/user/${userId}`);
export const updateSupportRequestApi = (id, changes) => axiosClient.put(`/api/shop/admin/support/${id}`, changes);
export const fetchShippingConfig = (admin = false) => axiosClient.get(`/api/shop/${admin ? "admin/" : ""}shipping/config`);
export const saveShippingConfigApi = (config) => axiosClient.put("/api/shop/admin/shipping/config", config);
