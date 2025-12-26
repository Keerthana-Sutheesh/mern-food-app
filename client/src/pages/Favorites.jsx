import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserFavorites, removeFromFavorites } from "../api/restaurant";

export default function Favorites() {
  const [favorites, setFavorites] = useState({ restaurants: [], menuItems: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await getUserFavorites();
      setFavorites(res.data);
    } catch (err) {
      setError("Failed to load favorites");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (type, itemId) => {
    try {
      await removeFromFavorites(type, itemId);
      
      if (type === "restaurant") {
        setFavorites(prev => ({
          ...prev,
          restaurants: prev.restaurants.filter(r => r._id !== itemId)
        }));
      } else {
        setFavorites(prev => ({
          ...prev,
          menuItems: prev.menuItems.filter(item => item._id !== itemId)
        }));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>

       
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Favorite Restaurants</h2>
          {favorites.restaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No favorite restaurants yet.</p>
              <Link
                to="/"
                className="inline-block mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.restaurants.map(restaurant => (
                <div key={restaurant._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h3>
                        <p className="text-gray-600 text-sm">{restaurant.cuisine}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite("restaurant", restaurant._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove from favorites"
                      >
                        ❤️
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>⭐ {restaurant.rating?.toFixed(1) || 'New'}</span>
                      <span>🕒 {restaurant.deliveryTime}</span>
                      <span>₹{restaurant.deliveryFee} delivery</span>
                    </div>
                    <Link
                      to={`/restaurant/${restaurant._id}`}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition text-center block"
                    >
                      View Menu
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

   
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Favorite Menu Items</h2>
          {favorites.menuItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No favorite menu items yet.</p>
              <Link
                to="/"
                className="inline-block mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.menuItems.map(item => (
                <div key={item._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600 text-sm">{item.restaurantName}</p>
                        <p className="text-orange-600 font-bold">₹{item.price}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite("menuItem", item._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove from favorites"
                      >
                        ❤️
                      </button>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">
                        {item.category.replace('_', ' ')}
                      </span>
                      {!item.isAvailable && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/restaurant/${item.restaurant}`}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition text-center block disabled:bg-gray-300"
                    >
                      View in Restaurant
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}