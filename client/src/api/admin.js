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

export const getAdminStats = () =>
  API.get("/admin/stats");

export const getAllRestaurants = () =>
  API.get("/admin/restaurants");

export const updateRestaurantStatus = (id, data) =>
  API.put(`/admin/restaurants/${id}/status`, data);

export const getAllUsers = () =>
  API.get("/admin/users");

export const updateUserRole = (id, data) =>
  API.put(`/admin/users/${id}/role`, data);