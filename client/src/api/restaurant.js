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

export const createRestaurant = (data) =>
  API.post("/owner/restaurant", data);

export const getMyRestaurant = () =>
  API.get("/owner/restaurant");

export const updateRestaurant = (data) =>
  API.put("/owner/restaurant", data);

export const getRestaurants = (params = {}) =>
  API.get("/restaurants", { params });

export const getRestaurantById = (id) =>
  API.get(`/restaurants/${id}`);

export const getNearbyRestaurants = (params) =>
  API.get("/restaurants/nearby", { params });


export const addMenuItem = (data) =>
  API.post("/owner/menu", data);

export const getMenuItems = () =>
  API.get("/owner/menu");

export const updateMenuItem = (id, data) =>
  API.put(`/owner/menu/${id}`, data);

export const deleteMenuItem = (id) =>
  API.delete(`/owner/menu/${id}`);

export const addToFavorites = (data) =>
  API.post("/favorites", data);

export const removeFromFavorites = (type, itemId) =>
  API.delete(`/favorites/${type}/${itemId}`);

export const getUserFavorites = () =>
  API.get("/favorites");

export const checkFavoriteStatus = (type, itemId) =>
  API.get(`/favorites/check/${type}/${itemId}`);
