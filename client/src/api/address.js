import api from './api';

export const addAddress = async (addressData) => {
  try {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAddresses = async () => {
  try {
    const response = await api.get('/users/addresses');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.put(`/users/addresses/${addressId}/default`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
