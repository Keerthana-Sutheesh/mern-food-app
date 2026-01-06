import api from "./api";

export const getAdminStats = () =>
  api.get("/admin/stats");

export const getAllRestaurants = () =>
  api.get("/admin/restaurants");

export const updateRestaurantStatus = (id, data) =>
  api.put(`/admin/restaurants/${id}/status`, data);

export const getAllUsers = () =>
  api.get("/admin/users");
