const NEWS_KEY = "highlands_news";
import { createSupportRequestApi, fetchSupportRequests, updateSupportRequestApi } from "./commerceService";

const read = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const write = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const getNews = () => read(NEWS_KEY);
export const getNewsById = (id) => read(NEWS_KEY).find((article) => String(article.id) === String(id));
export const saveNews = (article) => {
  const articles = read(NEWS_KEY);
  const saved = { ...article, id: article.id || Date.now(), createdAt: article.createdAt || new Date().toISOString() };
  const next = article.id ? articles.map((item) => item.id === article.id ? saved : item) : [saved, ...articles];
  write(NEWS_KEY, next);
  return saved;
};
export const deleteNews = (id) => write(NEWS_KEY, read(NEWS_KEY).filter((item) => item.id !== id));

export const getComplaints = async () => (await fetchSupportRequests()).data.filter(item => item.topic === "COMPLAINT");
export const createComplaint = (complaint) => createSupportRequestApi({
  userId: Number(complaint.userId), orderId: Number(complaint.orderId), name: complaint.userName,
  email: complaint.userName, topic: "COMPLAINT", priority: "HIGH",
  message: `${complaint.reason}: ${complaint.description}`,
});
export const updateComplaint = (id, changes) => updateSupportRequestApi(id, changes);
export const getSupportRequests = async () => (await fetchSupportRequests()).data.filter(item => item.topic !== "COMPLAINT");
export const createSupportRequest = (request) => createSupportRequestApi({ ...request, userId: request.userId ? Number(request.userId) : null });
export const updateSupportRequest = (id, changes) => updateSupportRequestApi(id, changes);
