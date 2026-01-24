import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const useAddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data.addresses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch addresses');
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  }, []);


  const addAddress = useCallback(async (addressData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/addresses', addressData);
      setAddresses(prev => [...prev, response.data.address]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add address';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  const updateAddress = useCallback(async (addressId, addressData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/users/addresses/${addressId}`, addressData);
      setAddresses(prev =>
        prev.map(addr => addr._id === addressId ? response.data.address : addr)
      );
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update address';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

 
  const deleteAddress = useCallback(async (addressId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/users/addresses/${addressId}`);
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete address';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  const setDefaultAddress = useCallback(async (addressId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/users/addresses/${addressId}/default`);
      setAddresses(prev =>
        prev.map(addr => ({
          ...addr,
          isDefault: addr._id === addressId
        }))
      );
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to set default address';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  const getDefaultAddress = useCallback(() => {
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  }, [addresses]);


  const getAddressById = useCallback((addressId) => {
    return addresses.find(addr => addr._id === addressId);
  }, [addresses]);

  
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    getAddressById
  };
};

export default useAddressManagement;
