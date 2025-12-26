import api from './api';

export const getMenuByRestaurant = (restaurantId) =>
  api.get(`/menus/${restaurantId}`);