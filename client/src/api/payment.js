import axios from "axios";

const API = axios.create({
  baseURL:`${process.env.REACT_APP_API_URL}/api/`
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const createRazorpayOrder = (orderData) =>
  API.post("/payments/create-order", orderData);

export const verifyPayment = (paymentData) =>
  API.post("/payments/verify", paymentData);


export const getSavedPaymentMethods = () =>
  API.get("/payments/saved-methods");

export const savePaymentMethod = (methodData) =>
  API.post("/payments/saved-methods", methodData);

export const deleteSavedPaymentMethod = (id) =>
  API.delete(`/payments/saved-methods/${id}`);

export const setDefaultPaymentMethod = (id) =>
  API.put(`/payments/saved-methods/${id}/default`);


export const getPaymentHistory = (params = {}) =>
  API.get("/payments/history", { params });

export const getPaymentReceipt = (id) =>
  API.get(`/payments/${id}/receipt`);
