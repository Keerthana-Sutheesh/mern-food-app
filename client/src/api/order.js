import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const createOrder = (orderData) =>
  API.post("/orders", orderData);

export const getOrders = (params = {}) =>
  API.get("/orders", { params });

export const getOrderById = (id) =>
  API.get(`/orders/${id}`);

export const updateOrderStatus = (id, statusData) =>
  API.put(`/orders/${id}/status`, statusData);

export const getOrderNotifications = (id) =>
  API.get(`/orders/${id}/notifications`);

export const markNotificationAsRead = (orderId, notificationId) =>
  API.put(`/orders/${orderId}/notifications/${notificationId}/read`);

export const getUserNotifications = () =>
  API.get("/orders/user/notifications");