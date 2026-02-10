import api from "./api";

export const getCart = async () => {
  try {
    const response = await api.get("/cart");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addToCart = async (cartData) => {
  try {
    const response = await api.post("/cart/add", cartData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCartItem = async (updateData) => {
  try {
    const response = await api.put("/cart/update", updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeCartItem = async (menuItemId) => {
  try {
    const response = await api.delete(`/cart/remove/${menuItemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete("/cart/clear");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
