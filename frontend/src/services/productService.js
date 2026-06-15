import axiosClient from "../api/axiosClient";

const CATEGORY_IMAGES_KEY = "highlands_category_images";
const getCategoryImages = () => JSON.parse(localStorage.getItem(CATEGORY_IMAGES_KEY) || "{}");
const saveCategoryImage = (id, imageUrl) => {
  const images = getCategoryImages();
  if (imageUrl) images[id] = imageUrl;
  else delete images[id];
  localStorage.setItem(CATEGORY_IMAGES_KEY, JSON.stringify(images));
};
const withCategoryImages = (response) => {
  const images = getCategoryImages();
  return { ...response, data: (response.data || []).map(category => ({ ...category, imageUrl: category.imageUrl || images[category.id] || "" })) };
};

export const getProducts = async () => {
  return axiosClient.get("/api/catalog/admin/products");
};

export const getAdminProducts = async () => {
  return axiosClient.get("/api/catalog/admin/products");
};

export const getProductById = async (id) => {
  return axiosClient.get(`/api/catalog/products/${id}`);
};

export const createProduct = async (data) => {
  return axiosClient.post("/api/catalog/admin/products", data);
};

export const updateProduct = async (id, data) => {
  return axiosClient.put(`/api/catalog/admin/products/${id}`, data);
};

export const deleteProduct = async (id) => {
  return axiosClient.delete(`/api/catalog/admin/products/${id}`);
};

export const getProductVariants = (id, admin = false) => axiosClient.get(`/api/catalog/${admin ? "admin/" : ""}products/${id}/variants`);
export const saveProductVariants = (id, variants) => axiosClient.put(`/api/catalog/admin/products/${id}/variants`, variants);

export const getCategories = async () => {
  return withCategoryImages(await axiosClient.get("/api/catalog/admin/categories"));
};

export const getAdminCategories = async () => {
  return withCategoryImages(await axiosClient.get("/api/catalog/admin/categories"));
};

export const createCategory = async (data) => {
  const response = await axiosClient.post("/api/catalog/admin/categories", data);
  saveCategoryImage(response.data.id, data.imageUrl);
  return { ...response, data: { ...response.data, imageUrl: data.imageUrl } };
};

export const updateCategory = async (id, data) => {
  const response = await axiosClient.put(`/api/catalog/admin/categories/${id}`, data);
  saveCategoryImage(id, data.imageUrl);
  return { ...response, data: { ...response.data, imageUrl: data.imageUrl } };
};

export const deleteCategory = async (id) => {
  const response = await axiosClient.delete(`/api/catalog/admin/categories/${id}`);
  saveCategoryImage(id, "");
  return response;
};
