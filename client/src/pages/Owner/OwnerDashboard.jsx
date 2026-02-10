import { Link } from "react-router-dom";
import { useOwnerRestaurant } from "../../hooks/useOwnerRestaurant";
import { useMenuForm } from "../../hooks/useMenuForm";
import OwnerFeedback from "./OwnerFeedback";
import { useState } from "react";

export default function OwnerDashboard() {
  const {
    restaurant,
    menuItems,
    loading,
    saveMenuItem,
    removeMenuItem
  } = useOwnerRestaurant();

  const {
    menuForm,
    editingItem,
    showMenuForm,
    setShowMenuForm,
    handleChange,
    startEdit,
    resetForm
  } = useMenuForm();

  const [customizations, setCustomizations] = useState([]);
  const menuCount = menuItems.length;
  const avgPrice = menuCount
    ? Math.round(
        menuItems.reduce((sum, item) => sum + Number(item.price || 0), 0) / menuCount
      )
    : 0;
  const vegCount = menuItems.filter((item) => item.isVegetarian || item.isVegan).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      ...menuForm,
      isVegetarian: menuForm.dietType === 'vegetarian',
      isVegan: menuForm.dietType === 'vegan',
      customizationOptions: customizations
    };
    await saveMenuItem(formData, editingItem?._id);
    resetForm();
    setCustomizations([]);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this menu item?")) {
      await removeMenuItem(id);
    }
  };

  const handleAddCustomization = () => {
    setCustomizations([
      ...customizations,
      { name: "", type: "select", options: [], price: 0 }
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm p-8 rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl">
          <div className="animate-spin h-16 w-16 border-4 border-amber-200 border-t-emerald-500 rounded-full"></div>
          <p className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Loading Restaurant Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="mb-10 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/70 text-gray-700 border border-gray-200/70 shadow-sm">
            <span>🍴</span> Owner Studio
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Restaurant Dashboard
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl">Shape your menu, refine your brand, and keep your kitchen flow smooth.</p>
        </div>

        {!restaurant ? (
          <div className="bg-white/80 dark:bg-gray-900/70 p-12 rounded-3xl border border-amber-100/80 dark:border-gray-700/60 shadow-xl text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-amber-900/40 dark:to-emerald-900/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🏡</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create Your Restaurant</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-base">Start with your profile and publish your first menu.</p>
            <Link
              to="/owner/create-restaurant"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <span className="text-2xl">➕</span> Create Restaurant
            </Link>
          </div>
        ) : (
          <>
            {/* Restaurant Info Card */}
            <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm p-8 rounded-3xl border border-gray-200/70 dark:border-gray-700/60 shadow-xl mb-8">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-amber-900/40 dark:to-emerald-900/40 rounded-3xl flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">🍽️</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{restaurant.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-base mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-xl">🍳</span> {restaurant.cuisine} <span className="text-gray-400">•</span> <span className="text-xl">📍</span> {restaurant.address}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                      restaurant.isApproved
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700'
                    }`}>
                      <span className="text-lg">{restaurant.isApproved ? "✅" : "⏳"}</span>
                      {restaurant.isApproved ? "Approved" : "Pending Approval"}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/70 text-gray-700 border border-gray-200 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-700">
                      <span className="text-lg">📋</span> {menuCount} items
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/70 text-gray-700 border border-gray-200 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-700">
                      <span className="text-lg">🌿</span> {vegCount} veg
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/70 text-gray-700 border border-gray-200 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-700">
                      <span className="text-lg">💰</span> Avg ₹{avgPrice || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Management Section */}
            <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm rounded-3xl border border-gray-200/70 dark:border-gray-700/60 shadow-xl mb-8 overflow-hidden">
              <div className="p-8 border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                      <span className="text-3xl">📋</span> Menu Studio
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-300">Craft, price, and curate your items.</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMenuForm(true);
                      setCustomizations([]);
                    }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center gap-3"
                  >
                    <span className="text-xl">➕</span> Add Item
                  </button>
                </div>
              </div>

              <div className="p-8">
                {menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-amber-900/40 dark:to-emerald-900/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">🍽️</span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Menu Items Yet</h4>
                    <p className="text-base text-gray-600 dark:text-gray-300 mb-6">Start building your menu with a signature dish.</p>
                    <button
                      onClick={() => {
                        setShowMenuForm(true);
                        setCustomizations([]);
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      <span className="text-xl mr-2">➕</span> Add Your First Item
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {menuItems.map((item, index) => (
                      <div
                        key={item._id}
                        className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-sm p-6 rounded-3xl border border-gray-200/70 dark:border-gray-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 leading-tight">{item.name}</h4>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{item.price}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-amber-900/40 dark:to-emerald-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🍕</span>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-gray-700 dark:text-gray-200 text-sm mb-4 leading-relaxed">{item.description}</p>
                        )}

                        {/* Diet Type & Spicy Level */}
                        <div className="flex items-center gap-2 mb-4">
                          {item.isVegetarian && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600">
                              <span>🌱</span> Veg
                            </span>
                          )}
                          {item.isVegan && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600">
                              <span>🌿</span> Vegan
                            </span>
                          )}
                          {item.spicyLevel && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600">
                              <span>🌶️</span> {item.spicyLevel}
                            </span>
                          )}
                        </div>

                        {item.nutritionalInfo && Object.values(item.nutritionalInfo).some(v => v > 0) && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200 dark:border-blue-700">
                            <p className="font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                              <span className="text-lg">📊</span> Nutrition Facts
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {item.nutritionalInfo.calories > 0 && (
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                  <span>🔥</span> {item.nutritionalInfo.calories} cal
                                </div>
                              )}
                              {item.nutritionalInfo.protein > 0 && (
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                  <span>💪</span> {item.nutritionalInfo.protein}g protein
                                </div>
                              )}
                              {item.nutritionalInfo.carbs > 0 && (
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                  <span>🍞</span> {item.nutritionalInfo.carbs}g carbs
                                </div>
                              )}
                              {item.nutritionalInfo.fat > 0 && (
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                  <span>🥑</span> {item.nutritionalInfo.fat}g fat
                                </div>
                              )}
                              {item.nutritionalInfo.fiber > 0 && (
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                  <span>🌾</span> {item.nutritionalInfo.fiber}g fiber
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => {
                              startEdit(item);
                              setCustomizations(item.customizationOptions || []);
                            }}
                            className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white py-3 rounded-2xl font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-[1.01] flex items-center justify-center gap-2"
                          >
                            <span className="text-lg">✏️</span> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white py-3 rounded-2xl font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-[1.01] flex items-center justify-center gap-2"
                          >
                            <span className="text-lg">🗑️</span> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add/Edit Menu Item Form */}
            {showMenuForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
                <form
                  onSubmit={handleSubmit}
                  className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-8 rounded-3xl w-full max-w-2xl space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/60 dark:border-gray-700/60"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-amber-900/40 dark:to-emerald-900/40 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">{editingItem ? "✏️" : "➕"}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Item Name *</label>
                      <input
                        name="name"
                        value={menuForm.name}
                        onChange={handleChange}
                        placeholder="Enter item name"
                        required
                        className="w-full border-2 border-gray-200 dark:border-gray-700 p-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={menuForm.description}
                        onChange={handleChange}
                        placeholder="Describe your delicious item"
                        rows="3"
                        className="w-full border-2 border-gray-200 dark:border-gray-700 p-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Price (₹) *</label>
                      <input
                        name="price"
                        type="number"
                        value={menuForm.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                        className="w-full border-2 border-gray-200 dark:border-gray-700 p-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Category</label>
                      <select
                        name="category"
                        value={menuForm.category}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 p-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                      >
                        <option value="appetizer">🍴 Appetizer</option>
                        <option value="main">🍽️ Main Course</option>
                        <option value="dessert">🍰 Dessert</option>
                        <option value="beverage">🥤 Beverage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Diet Type</label>
                      <select
                        name="dietType"
                        value={menuForm.dietType || 'non-veg'}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 p-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                      >
                        <option value="non-veg">🍖 Non-Vegetarian</option>
                        <option value="vegetarian">🌱 Vegetarian</option>
                        <option value="vegan">🌿 Vegan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Spicy Level</label>
                      <select
                        name="spicyLevel"
                        value={menuForm.spicyLevel}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 p-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                      >
                        <option value="mild">😊 Mild</option>
                        <option value="medium">😐 Medium</option>
                        <option value="hot">😅 Hot</option>
                        <option value="extra hot">🔥 Extra Hot</option>
                      </select>
                    </div>
                  </div>

                  {/* Nutritional Info */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-700">
                    <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                      <span className="text-lg">📊</span> Nutritional Information (Optional)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Calories</label>
                        <input
                          type="number"
                          name="nutritionalInfo.calories"
                          value={menuForm.nutritionalInfo.calories}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          className="w-full border border-emerald-200 dark:border-emerald-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Protein (g)</label>
                        <input
                          type="number"
                          name="nutritionalInfo.protein"
                          value={menuForm.nutritionalInfo.protein}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="w-full border border-emerald-200 dark:border-emerald-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          name="nutritionalInfo.carbs"
                          value={menuForm.nutritionalInfo.carbs}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="w-full border border-emerald-200 dark:border-emerald-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Fat (g)</label>
                        <input
                          type="number"
                          name="nutritionalInfo.fat"
                          value={menuForm.nutritionalInfo.fat}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="w-full border border-emerald-200 dark:border-emerald-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Fiber (g)</label>
                        <input
                          type="number"
                          name="nutritionalInfo.fiber"
                          value={menuForm.nutritionalInfo.fiber}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="w-full border border-emerald-200 dark:border-emerald-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customizations */}
                  <div className="bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-900/30 dark:to-emerald-900/30 p-6 rounded-2xl border border-amber-200 dark:border-amber-700">
                    <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                      <span className="text-lg">⚙️</span> Customizations
                    </h4>
                    {customizations.map((c, index) => (
                      <div key={index} className="border-2 border-amber-200 dark:border-amber-700 p-4 rounded-2xl mb-4 space-y-4 bg-white dark:bg-gray-800/60">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-amber-800 dark:text-amber-200">Customization {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = customizations.filter((_, i) => i !== index);
                              setCustomizations(updated);
                            }}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl"
                          >
                            ❌
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Customization name (e.g., Extra Cheese)"
                            value={c.name}
                            onChange={(e) => {
                              const updated = [...customizations];
                              updated[index].name = e.target.value;
                              setCustomizations(updated);
                            }}
                            className="w-full border border-amber-200 dark:border-amber-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all"
                          />
                          <select
                            value={c.type}
                            onChange={(e) => {
                              const updated = [...customizations];
                              updated[index].type = e.target.value;
                              if (e.target.value !== "select") updated[index].options = [];
                              setCustomizations(updated);
                            }}
                            className="w-full border border-amber-200 dark:border-amber-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all"
                          >
                            <option value="select">📋 Select Options</option>
                            <option value="boolean">✅ Yes / No</option>
                            <option value="text">💬 Text Input</option>
                          </select>
                          {c.type === "select" && (
                            <input
                              type="text"
                              placeholder="Options (comma separated)"
                              value={c.options.join(",")}
                              onChange={(e) => {
                                const updated = [...customizations];
                                updated[index].options = e.target.value.split(",");
                                setCustomizations(updated);
                              }}
                              className="w-full border border-amber-200 dark:border-amber-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all md:col-span-2"
                            />
                          )}
                          <input
                            type="number"
                            placeholder="Extra Price (₹)"
                            value={c.price}
                            onChange={(e) => {
                              const updated = [...customizations];
                              updated[index].price = Number(e.target.value);
                              setCustomizations(updated);
                            }}
                            min="0"
                            step="0.01"
                            className="w-full border border-amber-200 dark:border-amber-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddCustomization}
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center gap-2"
                    >
                      <span className="text-lg">➕</span> Add Customization
                    </button>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                      <span className="text-xl">{editingItem ? "💾" : "➕"}</span>
                      {editingItem ? "Update Item" : "Add Item"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setCustomizations([]);
                      }}
                      className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                      <span className="text-xl">❌</span> Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            {restaurant && <OwnerFeedback restaurantId={restaurant._id} />}
          </>
        )}
      </div>
    </div>
  );
}
