import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import api from '../api/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    preferences: {
      language: 'en',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    email: {
      promotions: true,
      orderUpdates: true,
      newRestaurants: true,
      security: true,
      newsletter: false
    },
    push: {
      orderUpdates: true,
      promotions: true,
      deliveryStatus: true
    },
    sms: {
      orderUpdates: false,
      security: true
    }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        preferences: user.preferences || {
          language: 'en',
          currency: 'INR',
          timezone: 'Asia/Kolkata'
        }
      });

      if (user.notifications) {
        setNotifications(user.notifications);
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/profile', profileData);
      setUser(response.data.user);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      console.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      console.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      console.log('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (type, key, value) => {
    const updatedNotifications = {
      ...notifications,
      [type]: {
        ...notifications[type],
        [key]: value
      }
    };

    setNotifications(updatedNotifications);

    try {
      await api.put('/users/notifications', updatedNotifications);
      console.log('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update notification preferences:', error.message);
      
      setNotifications(notifications);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }  
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-800 text-white">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-gray-300">Manage your account information and preferences</p>
          </div>

          <div className="p-6 space-y-8">
          
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

               
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        type="text"
                        value={profileData.address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        value={profileData.address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        value={profileData.address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                      <input
                        type="text"
                        value={profileData.address.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        value={profileData.address.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

             
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                      <select
                        value={profileData.preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="bn">Bengali</option>
                        <option value="te">Telugu</option>
                        <option value="mr">Marathi</option>
                        <option value="ta">Tamil</option>
                        <option value="ur">Urdu</option>
                        <option value="gu">Gujarati</option>
                        <option value="kn">Kannada</option>
                        <option value="or">Odia</option>
                        <option value="pa">Punjabi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Currency</label>
                      <select
                        value={profileData.preferences.currency}
                        onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timezone</label>
                      <select
                        value={profileData.preferences.timezone}
                        onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                        <option value="Asia/Dubai">GST (UTC+4)</option>
                        <option value="Europe/London">GMT (UTC+0)</option>
                        <option value="America/New_York">EST (UTC-5)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>

            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>

          
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>

             
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(notifications.email).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`email-${key}`}
                        checked={value}
                        onChange={(e) => handleNotificationChange('email', key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`email-${key}`} className="ml-2 text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Push Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(notifications.push).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`push-${key}`}
                        checked={value}
                        onChange={(e) => handleNotificationChange('push', key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`push-${key}`} className="ml-2 text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

             
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">SMS Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(notifications.sms).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`sms-${key}`}
                        checked={value}
                        onChange={(e) => handleNotificationChange('sms', key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`sms-${key}`} className="ml-2 text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;