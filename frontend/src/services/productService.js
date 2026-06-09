import axiosClient from "../api/axiosClient";

export const getProducts = async () => {
  return axiosClient.get("/api/catalog/products");
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

export const getCategories = async () => {
  return axiosClient.get("/api/catalog/products/categories");
};

export const createCategory = async (data) => {
  return axiosClient.post("/api/catalog/admin/categories", data);
};

export const updateCategory = async (id, data) => {
  return axiosClient.put(`/api/catalog/admin/categories/${id}`, data);
};

export const deleteCategory = async (id) => {
  return axiosClient.delete(`/api/catalog/admin/categories/${id}`);
};
