import { Link } from "react-router-dom";
import { useOwnerRestaurant } from "../../hooks/useOwnerRestaurant";
import { useMenuForm } from "../../hooks/useMenuForm";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveMenuItem(menuForm, editingItem?._id);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this menu item?")) {
      await removeMenuItem(id);
    }
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

         
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 flex justify-between items-center border-b">
                <h3 className="text-xl font-semibold">Menu</h3>
                <button
                  onClick={() => setShowMenuForm(true)}
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

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => startEdit(item)}
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

        
            {showMenuForm && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
                <form
                  onSubmit={handleSubmit}
                  className="bg-white p-6 rounded w-full max-w-md space-y-4"
                >
                  <input
                    name="name"
                    value={menuForm.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
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

                  <div className="flex gap-3">
                    <button className="flex-1 bg-orange-500 text-white py-2 rounded">
                      {editingItem ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-500 text-white py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
