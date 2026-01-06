import api from "./api";

export const createOrder = (orderData) =>
  api.post("/orders", orderData);

export const getOrders = (params = {}) =>
  api.get("/orders", { params });

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

export const updateOrderStatus = (id, statusData) =>
  api.put(`/orders/${id}/status`, statusData);

export const getOrderNotifications = (id) =>
  api.get(`/orders/${id}/notifications`);

export const markNotificationAsRead = (orderId, notificationId) =>
  api.put(`/orders/${orderId}/notifications/${notificationId}/read`);

export const getUserNotifications = () =>
  api.get("/orders/user/notifications");