import api from "./api";

export const createRestaurant = (data) =>
  api.post("/owner/restaurant", data);

export const getMyRestaurant = () =>
  api.get("/owner/restaurant");

export const updateRestaurant = (data) =>
  api.put("/owner/restaurant", data);

export const getRestaurants = (params = {}) =>
  api.get("/restaurants", { params });

export const getRestaurantById = (id) =>
  api.get(`/restaurants/${id}`);

export const getNearbyRestaurants = (params) =>
  api.get("/restaurants/nearby", { params });
export const addMenuItem = (data) =>
  api.post("/owner/menu", data);

export const getMenuItems = () =>
  api.get("/owner/menu");

export const updateMenuItem = (id, data) =>
  api.put(`/owner/menu/${id}`, data);

export const deleteMenuItem = (id) =>
  api.delete(`/owner/menu/${id}`);