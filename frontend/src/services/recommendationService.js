import axiosClient from "../api/axiosClient";

const RECOMMENDATION_URL = "/api/review/recommendations";
const RECOMMENDATION_POST_URL = "/api/review";

export const getRecommendationsByProduct = async (productName) => {
  return axiosClient.get(`${RECOMMENDATION_URL}?name=${encodeURIComponent(productName)}`);
};

export const getRecommendationsByUser = async (userId) => {
  return axiosClient.get(`${RECOMMENDATION_POST_URL}/${userId}/recommendations`);
};

export const saveRecommendation = async (userId, productId, rating, comment, imageUrl) => {
  return axiosClient.post(`${RECOMMENDATION_POST_URL}/${userId}/recommendations/${productId}`, {
    rating: rating.toString(),
    comment: comment || "",
    imageUrl: imageUrl || ""
  });
};
