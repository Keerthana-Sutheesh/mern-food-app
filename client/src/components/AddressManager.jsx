import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import api from '../api/api';

const AddressManager = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');


  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const normalizeFormData = (data) => ({
    ...data,
    label: (data.label || '').trim(),
    street: (data.street || '').trim(),
    city: (data.city || '').trim(),
    state: (data.state || '').trim(),
    zipCode: (data.zipCode || '').trim(),
    country: (data.country || '').trim()
  });

  const validateForm = (data) => {
    const errors = {};
    const allowedLabels = ['Home', 'Office', 'Other'];

    if (!data.label || !allowedLabels.includes(data.label)) {
      errors.label = 'Please select a valid address label';
    }
    
    if (!data.street) {
      errors.street = 'Street address is required';
    } else if (data.street.length < 5) {
      errors.street = 'Street address must be at least 5 characters';
    } else if (data.street.length > 120) {
      errors.street = 'Street address must be under 120 characters';
    }
    
    if (!data.city) {
      errors.city = 'City is required';
    } else if (data.city.length < 2) {
      errors.city = 'City must be at least 2 characters';
    } else if (data.city.length > 60) {
      errors.city = 'City must be under 60 characters';
    }
    
    if (!data.state) {
      errors.state = 'State is required';
    } else if (data.state.length < 2) {
      errors.state = 'State must be at least 2 characters';
    } else if (data.state.length > 60) {
      errors.state = 'State must be under 60 characters';
    }
    
    if (!data.zipCode) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5,6}$/.test(data.zipCode)) {
      errors.zipCode = 'ZIP code must be 5-6 digits';
    }
    
    if (!data.country) {
      errors.country = 'Country is required';
    } else if (data.country.length < 2) {
      errors.country = 'Country must be at least 2 characters';
    } else if (data.country.length > 60) {
      errors.country = 'Country must be under 60 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      label: 'Home',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false
    });
    setFormErrors({});
    setSubmitError('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const normalized = normalizeFormData(formData);

    if (!validateForm(normalized)) {
      return;
    }
    
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/users/addresses/${editingId}`, normalized);
        console.log('Address updated successfully');
      } else {
        await api.post('/users/addresses', normalized);
        console.log('Address added successfully');
      }
      
      await fetchAddresses();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save address';
      setSubmitError(errorMessage);
      console.error('Error saving address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setLoading(true);
      try {
        await api.delete(`/users/addresses/${addressId}`);
        console.log('Address deleted successfully');
        await fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    setLoading(true);
    try {
      await api.put(`/users/addresses/${addressId}/default`);
      console.log('Default address updated');
      await fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-xl p-6 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🏠 My Addresses</h2>

      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border-l-4 border-blue-600 dark:border-blue-400 shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? '✏️ Edit Address' : '➕ Add New Address'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address Label</label>
                <select
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                  required
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Office">🏢 Office</option>
                  <option value="Other">📍 Other</option>
                </select>
                {formErrors.label && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.label}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                  required
                />
                {formErrors.country && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.country}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main Street, Apartment 4B"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
                  formErrors.street 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                }`}
                required
              />
              {formErrors.street && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
                    formErrors.city 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                  required
                />
                {formErrors.city && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
                    formErrors.state 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                  required
                />
                {formErrors.state && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
                    formErrors.zipCode 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                  required
                />
                {formErrors.zipCode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.zipCode}</p>
                )}
              </div>
            </div>

            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="ml-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                ⭐ Set as default address
              </label>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">❌ {submitError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? '⏳ Saving...' : editingId ? '💾 Update Address' : '✨ Add Address'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          ➕ Add New Address
        </button>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">📭 No addresses saved yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first address to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`p-5 rounded-xl border-2 transition-all transform hover:scale-105 hover:shadow-lg cursor-pointer ${
                address.isDefault
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {address.label === 'Home' && '🏠 '}
                    {address.label === 'Office' && '🏢 '}
                    {address.label === 'Other' && '📍 '}
                    {address.label}
                  </h3>
                  {address.isDefault && (
                    <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-xs font-bold rounded-full shadow-sm">
                      ⭐ Default
                    </span>
                  )}
                </div>
              </div>

              <div className="text-gray-700 dark:text-gray-300 space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium">📍 {address.street}</p>
                <p className="text-sm">
                  🌍 {address.city}, {address.state} {address.zipCode}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{address.country}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleEdit(address)}
                  disabled={loading}
                  className="flex-1 min-w-[70px] px-3 py-2 text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors disabled:opacity-50"
                >
                  ✏️ Edit
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    disabled={loading}
                    className="flex-1 min-w-[90px] px-3 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    ⭐ Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(address._id)}
                  disabled={loading}
                  className="flex-1 min-w-[70px] px-3 py-2 text-sm font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
