import api from "./api"

export const createRazorpayOrder = (orderData) =>
  api.post("/payments/create-order", orderData);

export const verifyPayment = (paymentData) =>
  api.post("/payments/verify", paymentData);
export const getSavedPaymentMethods = () =>
  api.get("/payments/saved-methods");

export const savePaymentMethod = (methodData) =>
  api.post("/payments/saved-methods", methodData);

export const deleteSavedPaymentMethod = (id) =>
  api.delete(`/payments/saved-methods/${id}`);

export const setDefaultPaymentMethod = (id) =>
  api.put(`/payments/saved-methods/${id}/default`);

export const getPaymentHistory = (params = {}) =>
  api.get("/payments/history", { params });

export const getPaymentReceipt = (id) =>
  api.get(`/payments/${id}/receipt`);