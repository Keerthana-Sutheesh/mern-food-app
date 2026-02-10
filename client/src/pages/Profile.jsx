import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import api from '../api/api';
import AddressManager from '../components/AddressManager';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-4">
            <span className="text-4xl">👤</span> Profile Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Manage your account information and preferences</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl mb-8 overflow-hidden">
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
            {[
              { id: "personal", label: "Personal Info 👤", icon: "📋" },
              { id: "security", label: "Security 🔒", icon: "🛡️" },
              { id: "addresses", label: "Addresses 📍", icon: "🏠" },
              { id: "notifications", label: "Notifications 🔔", icon: "📢" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-6 font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
   
{/* Personal Information Tab */}
        {activeTab === "personal" && (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <span className="text-3xl">📋</span> Personal Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Update your personal details and preferences</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-8">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-3xl flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.name || 'Your Name'}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                        user?.role === 'admin'
                          ? 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600'
                          : user?.role === 'owner'
                          ? 'bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-600'
                          : 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600'
                      }`}>
                        <span className="text-lg">
                          {user?.role === 'admin' ? '👑' : user?.role === 'owner' ? '🏪' : '👤'}
                        </span>
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="text-lg">👤</span> Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-lg"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="text-lg">📱</span> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-lg"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="text-lg">🎂</span> Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-lg"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚧️</span> Gender
                  </label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-lg"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">👨 Male</option>
                    <option value="female">👩 Female</option>
                    <option value="other">🧑 Other</option>
                    <option value="prefer-not-to-say">🤐 Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
                <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-6 flex items-center gap-2">
                  <span className="text-2xl">⚙️</span> Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-base font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">🌐</span> Language
                    </label>
                    <select
                      value={profileData.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full border-2 border-purple-300 dark:border-purple-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all text-lg"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="hi">🇮🇳 Hindi</option>
                      <option value="bn">🇧🇩 Bengali</option>
                      <option value="te">🇮🇳 Telugu</option>
                      <option value="mr">🇮🇳 Marathi</option>
                      <option value="ta">🇮🇳 Tamil</option>
                      <option value="ur">🇵🇰 Urdu</option>
                      <option value="gu">🇮🇳 Gujarati</option>
                      <option value="kn">🇮🇳 Kannada</option>
                      <option value="or">🇮🇳 Odia</option>
                      <option value="pa">🇮🇳 Punjabi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">💰</span> Currency
                    </label>
                    <select
                      value={profileData.preferences.currency}
                      onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                      className="w-full border-2 border-purple-300 dark:border-purple-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all text-lg"
                    >
                      <option value="INR">🇮🇳 INR (₹)</option>
                      <option value="USD">🇺🇸 USD ($)</option>
                      <option value="EUR">🇪🇺 EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">🕐</span> Timezone
                    </label>
                    <select
                      value={profileData.preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="w-full border-2 border-purple-300 dark:border-purple-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all text-lg"
                    >
                      <option value="Asia/Kolkata">🇮🇳 IST (UTC+5:30)</option>
                      <option value="Asia/Dubai">🇦🇪 GST (UTC+4)</option>
                      <option value="Europe/London">🇬🇧 GMT (UTC+0)</option>
                      <option value="America/New_York">🇺🇸 EST (UTC-5)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin text-2xl">⏳</span>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">💾</span>
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">📍</span> Address Management
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Manage your delivery addresses</p>
            </div>
            <AddressManager />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">🔔</span> Notification Preferences
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Choose how you want to be notified</p>
            </div>

            <div className="space-y-8">
              {/* Email Notifications */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📧</span> Email Notifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(notifications.email).map(([key, value]) => (
                    <label key={key} className="flex items-center p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-blue-200 dark:border-blue-600 hover:shadow-md transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNotificationChange('email', key, e.target.checked)}
                        className="w-5 h-5 accent-blue-600 rounded"
                      />
                      <span className="ml-4 text-gray-900 dark:text-white font-semibold text-base capitalize flex-1">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className="text-2xl">
                        {key === 'promotions' && '🎉'}
                        {key === 'orderUpdates' && '📦'}
                        {key === 'newRestaurants' && '🏪'}
                        {key === 'security' && '🔒'}
                        {key === 'newsletter' && '📧'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-6 rounded-2xl border border-green-200 dark:border-green-700">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📱</span> Push Notifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(notifications.push).map(([key, value]) => (
                    <label key={key} className="flex items-center p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-green-200 dark:border-green-600 hover:shadow-md transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNotificationChange('push', key, e.target.checked)}
                        className="w-5 h-5 accent-green-600 rounded"
                      />
                      <span className="ml-4 text-gray-900 dark:text-white font-semibold text-base capitalize flex-1">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className="text-2xl">
                        {key === 'orderUpdates' && '📦'}
                        {key === 'promotions' && '🎉'}
                        {key === 'deliveryStatus' && '🚚'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
                <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-6 flex items-center gap-2">
                  <span className="text-2xl">💬</span> SMS Notifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(notifications.sms).map(([key, value]) => (
                    <label key={key} className="flex items-center p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-purple-200 dark:border-purple-600 hover:shadow-md transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNotificationChange('sms', key, e.target.checked)}
                        className="w-5 h-5 accent-purple-600 rounded"
                      />
                      <span className="ml-4 text-gray-900 dark:text-white font-semibold text-base capitalize flex-1">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className="text-2xl">
                        {key === 'orderUpdates' && '📦'}
                        {key === 'security' && '🔒'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <span className="text-3xl">🔒</span> Security Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Change your password and manage security preferences</p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 p-6 rounded-2xl border border-red-200 dark:border-red-700">
                <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🔑</span> Change Password
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">🔒</span> Current Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full border-2 border-red-300 dark:border-red-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all text-lg"
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">🆕</span> New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full border-2 border-red-300 dark:border-red-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all text-lg"
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">✅</span> Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full border-2 border-red-300 dark:border-red-600 p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all text-lg"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      Password must be at least 6 characters long and contain a mix of letters, numbers, and special characters for better security.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin text-2xl">⏳</span>
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🔑</span>
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;