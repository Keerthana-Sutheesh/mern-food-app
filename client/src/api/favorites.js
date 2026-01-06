import api from "./api";

export const addToFavorites = (data) =>
  api.post("/favorites", data);

export const removeFromFavorites = (type, itemId) =>
  api.delete(`/favorites/${type}/${itemId}`);

export const getUserFavorites = () =>
  api.get("/favorites");

export const checkFavoriteStatus = (type, itemId) =>
  api.get(`/favorites/check/${type}/${itemId}`);