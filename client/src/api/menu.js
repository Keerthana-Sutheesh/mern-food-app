import api from './api';

export const getRestaurantById = (restaurantId) =>
  api.get(`/restaurant/${restaurantId}`);

