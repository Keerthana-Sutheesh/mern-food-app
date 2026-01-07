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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Restaurant Dashboard</h1>

        {!restaurant ? (
          <Link
            to="/owner/create-restaurant"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg"
          >
            Create Restaurant
          </Link>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-2xl font-bold">{restaurant.name}</h2>
              <p className="text-gray-600">
                {restaurant.cuisine} • {restaurant.address}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6 flex justify-between items-center border-b">
                <h3 className="text-xl font-semibold">Menu</h3>
                <button
                  onClick={() => {
                    setShowMenuForm(true);
                    setCustomizations([]);
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded"
                >
                  Add Item
                </button>
              </div>

              <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <div key={item._id} className="border p-4 rounded">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-orange-600 font-bold">₹{item.price}</p>

                    {item.description && (
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    )}

                    {item.nutritionalInfo &&
                      Object.values(item.nutritionalInfo).some(v => v > 0) && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <div className="grid grid-cols-2 gap-1 text-gray-600">
                            {item.nutritionalInfo.calories > 0 && (
                              <span>🔥 {item.nutritionalInfo.calories} cal</span>
                            )}
                            {item.nutritionalInfo.protein > 0 && (
                              <span>💪 {item.nutritionalInfo.protein}g protein</span>
                            )}
                            {item.nutritionalInfo.carbs > 0 && (
                              <span>🍞 {item.nutritionalInfo.carbs}g carbs</span>
                            )}
                            {item.nutritionalInfo.fat > 0 && (
                              <span>🥑 {item.nutritionalInfo.fat}g fat</span>
                            )}
                            {item.nutritionalInfo.fiber > 0 && (
                              <span>🌾 {item.nutritionalInfo.fiber}g fiber</span>
                            )}
                          </div>
                        </div>
                      )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          startEdit(item);
                          setCustomizations(item.customizationOptions || []);
                        }}
                        className="flex-1 bg-blue-500 text-white py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 bg-red-500 text-white py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add/Edit Menu Item Form */}
            {showMenuForm && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
                <form
                  onSubmit={handleSubmit}
                  className="bg-white p-6 rounded w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto"
                >
                  <h3 className="text-xl font-semibold">
                    {editingItem ? "Edit Item" : "Add Menu Item"}
                  </h3>

                  <input
                    name="name"
                    value={menuForm.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                    className="w-full border p-2 rounded"
                  />

                  <textarea
                    name="description"
                    value={menuForm.description}
                    onChange={handleChange}
                    placeholder="Description"
                    className="w-full border p-2 rounded"
                  />

                  <input
                    name="price"
                    type="number"
                    value={menuForm.price}
                    onChange={handleChange}
                    placeholder="Price"
                    required
                    className="w-full border p-2 rounded"
                  />

                  <select
                    name="category"
                    value={menuForm.category}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="appetizer">Appetizer</option>
                    <option value="main">Main</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                  </select>

                  <select
                    name="dietType"
                    value={menuForm.dietType || 'non-veg'}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>

                  <select
                    name="spicyLevel"
                    value={menuForm.spicyLevel}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="mild">Mild</option>
                    <option value="medium">Medium</option>
                    <option value="hot">Hot</option>
                    <option value="extra hot">Extra Hot</option>
                  </select>

                  {/* Nutritional Info */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="nutritionalInfo.calories"
                      value={menuForm.nutritionalInfo.calories}
                      onChange={handleChange}
                      placeholder="Calories"
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="number"
                      name="nutritionalInfo.protein"
                      value={menuForm.nutritionalInfo.protein}
                      onChange={handleChange}
                      placeholder="Protein (g)"
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="number"
                      name="nutritionalInfo.carbs"
                      value={menuForm.nutritionalInfo.carbs}
                      onChange={handleChange}
                      placeholder="Carbs (g)"
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="number"
                      name="nutritionalInfo.fat"
                      value={menuForm.nutritionalInfo.fat}
                      onChange={handleChange}
                      placeholder="Fat (g)"
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="number"
                      name="nutritionalInfo.fiber"
                      value={menuForm.nutritionalInfo.fiber}
                      onChange={handleChange}
                      placeholder="Fiber (g)"
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  {/* Customizations */}
                  <div className="mt-3">
                    <h4 className="font-semibold mb-2">Customizations</h4>
                    {customizations.map((c, index) => (
                      <div key={index} className="border p-2 rounded mb-2 space-y-1">
                        <input
                          type="text"
                          placeholder="Name"
                          value={c.name}
                          onChange={(e) => {
                            const updated = [...customizations];
                            updated[index].name = e.target.value;
                            setCustomizations(updated);
                          }}
                          className="w-full border p-2 rounded"
                        />
                        <select
                          value={c.type}
                          onChange={(e) => {
                            const updated = [...customizations];
                            updated[index].type = e.target.value;
                            if (e.target.value !== "select") updated[index].options = [];
                            setCustomizations(updated);
                          }}
                          className="w-full border p-2 rounded"
                        >
                          <option value="select">Select</option>
                          <option value="boolean">Yes / No</option>
                          <option value="text">Text</option>
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
                            className="w-full border p-2 rounded"
                          />
                        )}
                        <input
                          type="number"
                          placeholder="Extra Price"
                          value={c.price}
                          onChange={(e) => {
                            const updated = [...customizations];
                            updated[index].price = Number(e.target.value);
                            setCustomizations(updated);
                          }}
                          className="w-full border p-2 rounded"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddCustomization}
                      className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
                    >
                      + Add Customization
                    </button>
                  </div>

                  <div className="flex gap-3 mt-3">
                    <button className="flex-1 bg-orange-500 text-white py-2 rounded">
                      {editingItem ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setCustomizations([]);
                      }}
                      className="flex-1 bg-gray-500 text-white py-2 rounded"
                    >
                      Cancel
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
